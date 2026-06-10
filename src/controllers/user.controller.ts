import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud, deleteFromCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId).lean();
        const accessTokens = await user.generateAccessTokens();
        const refreshTokens = await user.generateRefreshTokens();

        user.refreshTokens = refreshTokens;
        await user.save({ validateBeforeSave: false });
        return { accessTokens, refreshTokens };
    } catch (error) {
        throw new ApiError(500, "unable to generate access and refresh tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, userName, password, email } = req.body;

    if (
        [fullName, userName, password, email].some(
            (feild) => feild?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All feilds are required");
    }
    const existsUser = await User.findOne({ userName }).lean();
    if (existsUser) {
        throw new ApiError(400, "user already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file path is required to register");
    }
    const avatar = await uploadOnCloud(avatarLocalPath);

    const coverImage = await uploadOnCloud(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "avatar is required to register");
    }

    const user = await User.create({
        userName: userName.toLowerCase(),
        fullName,
        email,
        avatar: {
            public_id: avatar?.public_id,
            url: avatar?.secure_url,
        },
        coverImage: coverImage
            ? {
                public_id: coverImage?.public_id,
                url: coverImage?.secure_url,
            }
            : {},
        password,
    });
    const createdUser = await User.findById(user._id).lean().select(
        " -password -refreshTokens"
    );
    if (!createdUser) {
        throw new ApiError(500, "Unable to register user");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;
    if (!(userName || email)) {
        throw new ApiError(407, "username or email is required to login");
    }
    if (!password) {
        throw new ApiError(407, "password is required to login");
    }
    const user = await User.findOne({
        $or: [{ userName }, { email }],
    }).lean();

    if (!user) {
        throw new ApiError(404, "user is not registered yet");
    }

    const isPassValid = await user.isPasswordCorrect(password);
    if (!isPassValid) {
        throw new ApiError(401, "invalid password credentials");
    }

    const { accessTokens, refreshTokens } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedUser = await User.findById(user._id).lean().select(
        "-password -refreshTokens"
    );

    const AtOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000, //cookie's max age is 1 hour
    };
    const RtOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 3 * 24 * 60 * 60 * 1000, //cookie's max age is 3 days
    };

    return res
        .status(200)
        .cookie("accessTokens", accessTokens, AtOptions)
        .cookie("refreshTokens", refreshTokens, RtOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser,
                },
                "user logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshTokens: "",
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .clearCookie("accessTokens")
        .clearCookie("refreshTokens")
        .json(new ApiResponse(200, {}, "user loggedout successfully"));
});

const refreshAccessTokens = asyncHandler(async (req, res) => {
    const incomingRefreshTokens =
        req.cookies.refreshTokens || req.body.refreshTokens;

    if (!incomingRefreshTokens) {
        throw new ApiError(401, "unauthorized refreshToken ");
    }

    const decodedToken = jwt.verify(
        incomingRefreshTokens,
        process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id).lean();

    if (!user) {
        throw new ApiError(404, "user not found");
    }

    const { accessTokens, refreshTokens } =
        await generateAccessAndRefreshTokens(user._id);

    const AtOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000, //cookie's max age is 1 hour
    };
    const RtOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 3 * 24 * 60 * 60 * 1000, //cookie's max age is 3 days
    };

    return res
        .status(200)
        .cookie("accessTokens", accessTokens, AtOptions)
        .cookie("refreshTokens", refreshTokens, RtOptions)
        .json(
            new ApiResponse(
                200,
                { user: user, accessTokens, refreshTokens },
                "generated new access tokens successfully"
            )
        );
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword || newPassword)) {
        throw new ApiError(
            400,
            "oldPassword and newPassword is required to make changes"
        );
    }
    const user = await User.findById(req.user?._id).lean();
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "wrong password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, "Your password is changed successfully"));
});

const currentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched successfully")
        );
});

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId).lean().select("-password -refreshTokens");
    if (!user) {
        throw new ApiError(500, "Unable to find user");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "user fetched successfully"));
});

const updateAccountInfo = asyncHandler(async (req, res) => {
    const { fullname, email, username } = req.body;
    const UpdatedFields = {};
    if (fullname) {
        UpdatedFields.fullName = fullname;
    }
    if (username) {
        UpdatedFields.userName = username;
    }
    if (email) {
        UpdatedFields.email = email;
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: UpdatedFields,
        },
        {
            returnDocument:"after",
        }
    ).lean().select("-password");
    return res
        .status(200)
        .json(new ApiResponse(200, user, "information updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "uploaded avatar file path unaccessable");
    }
    const avatar = await uploadOnCloud(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(401, "clodinary upload of avatar failed");
    }
    const user = req.user;
    const fileToBeDeleted = user.avatar?.public_id;

    const updateAvatar = await User.findByIdAndUpdate(
        user?._id,
        {
            $set: {
                avatar: {
                    public_id: avatar?.public_id,
                    url: avatar?.secure_url,
                },
            },
        },
        { returnDocument:"after" }
    ).lean().select("-password -refreshTokens");

    if (fileToBeDeleted) {
        try {
            await deleteFromCloud(fileToBeDeleted);
        } catch (err) {
            throw new ApiError(504, "error while deleting file From Cloud");
        }
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, updateAvatar, "avatar updated successfully")
        );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "uploaded cover image file path unaccessable");
    }
    const coverImage = await uploadOnCloud(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(401, "clodinary upload of cover image failed ");
    }
    const user = req.user;
    const public_id = user.coverImage?.public_id;
    const fileToBeDeleted = public_id;

    const updateCoverImage = await User.findByIdAndUpdate(
        user?._id,
        {
            $set: {
                coverImage: {
                    public_id: coverImage?.public_id,
                    url: coverImage?.secure_url,
                },
            },
        },
        { returnDocument:"after" }
    ).lean().select("-password -refreshTokens");

    if (!updateCoverImage) {
        throw new ApiError(404, "Could'nt update the coverImage");
    }
    if (fileToBeDeleted) {
        try {
            const fileDeleted = await deleteFromCloud(fileToBeDeleted);
        } catch (err) {
            throw new ApiError(504, "error while deleting file From Cloud");
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updateCoverImage,
                "cover image updated successfully "
            )
        );
});
const showUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribed",
            },
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedCount: {
                    $size: "$subscribed",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelsSubscribedCount: 1,
                isSubscribed: 1,
            },
        },
    ]);
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "user profile fetched successfully"
            )
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: req.user?._id,
            },
        },
        {
            $lookup: {
                //instead of doing a normal scope based lookup(which was not as per the order we needed) we are using let + pipeline to get the watch history as per the array order(most recent first)
                from: "videos",
                let: { history: "$watchHistory" }, //created variable which has the watch history array(correctly ordered one) of user
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$_id", "$$history"] }, // match the video ids with the ids inside the watch history
                        },
                    },
                    {
                        $addFields: {
                            order: { $indexOfArray: ["$$history", "$_id"] }, // get the copy of the correct order of index of array from history to video ids we have
                        },
                    },
                    {
                        $sort: {
                            order: 1, //sort the videos as per order
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
                as: "watchHistory",
            },
        },
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "user watchhistory fetched successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessTokens,
    changePassword,
    currentUser,
    updateAccountInfo,
    updateUserAvatar,
    updateUserCoverImage,
    showUserProfile,
    getWatchHistory,
    getUserById,
};
