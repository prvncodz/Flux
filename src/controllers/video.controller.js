import mongoose, { isValidObjectId, Types } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { View } from "../models/view.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloud, deleteFromCloud } from "../utils/cloudinary.js";
import { Like } from "../models/like.model.js";

const getAllVideosByUser = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "page number is invalid");
    }
    if (isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "limit number is invalid");
    }
    const filter = {};
    filter.isPublished = true;
    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }
    if (userId) {
        filter.owner = userId;
    }
    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortType === "desc" ? -1 : 1;
    }
    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skipNum)
        .limit(limitNum)
        .populate("owner", "avatar fullName userName");

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "videos fetched succesfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "page number is invalid");
    }
    if (isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "limit number is invalid");
    }
    const filter = {};
    filter.isPublished = true;
    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }
    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortType === "desc" ? -1 : 1;
    }
    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skipNum)
        .limit(limitNum)
        .populate("owner", "avatar fullName userName");

    const promises = videos.map(async (video) => {
        const obj = video.toObject();
        obj.isLiked = userId
            ? !!(await Like.exists({ video: video?._id, likedBy: userId }))
            : false;
        return obj;
    });

    const allVideos = await Promise.all(promises);
    if (!allVideos) {
        throw new ApiError(500, "unable to fetch all videos with like status");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, allVideos, "videos fetched succesfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            throw new ApiError(
                403,
                "title field is required to publish a video"
            );
        }
        const videoFileToPath = req.files?.videofile?.[0]?.path;
        const thumbnailFileToPath = req.files?.thumbnail?.[0]?.path;

        if (!videoFileToPath) {
            throw new ApiError(403, "unable to fetch video file path");
        }
        if (!thumbnailFileToPath) {
            throw new ApiError(403, "unable to fetch thumbnail file path");
        }

        const videoResponse = await uploadOnCloud(videoFileToPath);
        const thumbnailResponse = await uploadOnCloud(thumbnailFileToPath);

        if (!videoResponse) {
            throw new ApiError(500, "video upload to cloudinary failed");
        }
        if (!thumbnailResponse) {
            throw new ApiError(500, "thumbnail upload to cloudinary failed");
        }
        const user = await User.findById(req.user?._id);
        if (!user) {
            throw ApiError(400, "cannot find user");
        }
        const UploadedVideo = await Video.create({
            videofile: {
                public_id: videoResponse.public_id,
                url: videoResponse.secure_url,
            },
            thumbnail: {
                public_id: thumbnailResponse.public_id,
                url: thumbnailResponse.secure_url,
            },
            owner: user._id,
            description: description ? description : "",
            title: title,
            duration: videoResponse?.duration,
            isPublished: false,
        });
        if (!UploadedVideo) {
            throw new ApiError(500, "error while publishing video");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    UploadedVideo,
                    "video uploaded  succesfully"
                )
            );
    } catch (error) {
        console.log("Error :", error.message);
        throw new ApiError(500, "unable to publish the video");
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const visitorId = req.user?._id || req.visitorId;
    const { userId } = req.query;

    if (!videoId) {
        throw new ApiError(403, "video id is invalid");
    }

    if (req.user?._id) {
        try {
            const videoObjectId = new mongoose.Types.ObjectId(videoId);
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $pull: { watchHistory: videoObjectId },
                },
                {
                    new: true,
                }
            );
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $push: {
                        watchHistory: {
                            $each: [videoObjectId],
                            $position: 0,
                            $slice: 50,
                        },
                    },
                },
                {
                    new: true,
                }
            );
        } catch (err) {
            console.log(err.message);
            throw new ApiError(
                500,
                "error while adding video to watch history"
            );
        }
    }
    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        },
                    },
                    {
                        $addFields: {
                            totalSubscribers: { $size: "$subscribers" },
                            isSubscribedByUser: {
                                $cond: {
                                    if: {
                                        $in: [
                                            req.user?._id,
                                            "$subscribers.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            totalSubscribers: 1,
                            isSubscribedByUser: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerDetails",
                },
            },
        },
        {
            $project: {
                _id: 1,
                videofile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                createdAt: 1,
                views: 1,
                duration: 1,
                isPublished: 1,
                owner: 1,
            },
        },
    ];
    const video = await Video.aggregate(pipeline);
    if (!video?.length) {
        throw new ApiError(500, "video does'nt exists");
    }

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const hasViewed = await View.exists({
        videoId,
        userId: visitorId,
        createdAt: {
            $gt: oneHourAgo,
        },
    });

    if (!hasViewed) {
        try {
            await View.create({
                videoId,
                userId: visitorId,
            });
            await Video.findByIdAndUpdate(videoId, {
                $inc: {
                    views: 1,
                },
            });
        } catch (err) {
            console.log(err.message);
            throw new ApiError(500, "error while updating video");
        }
    }

    let finalVideo = video[0];
    finalVideo.isLiked = userId
        ? !!(await Like.exists({
              video: videoId,
              likedBy: userId,
          }))
        : false;
    if (!finalVideo) {
        throw new ApiError(500, "error while adding like status to video");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalVideo, "video fetched by id succesfully")
        );
});

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "videoid is not provided in videoId");
        }

        const { title, description } = req.body;

        const NewThumbnailPath = req.file?.path;
        let thumbnailResponse;
        if (NewThumbnailPath) {
            thumbnailResponse = await uploadOnCloud(NewThumbnailPath);
        }
        const video = await Video.findById(videoId);
        const fileToBeDeleted = video?.thumbnail.public_id;
        const videoChanges = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    ...(thumbnailResponse && {
                        thumbnail: {
                            ...(thumbnailResponse?.secure_url && {
                                url: thumbnailResponse.secure_url,
                            }),
                            ...(thumbnailResponse?.public_id && {
                                public_id: thumbnailResponse.public_id,
                            }),
                        },
                    }),
                    ...(title && { title: title }),
                    ...(description && { description: description }),
                },
            },
            {
                new: true,
            }
        );

        if (thumbnailResponse) {
            if (!fileToBeDeleted) {
                throw new ApiError(500, "unable to find old thumbnail");
            }
            const deletedThumbnail = await deleteFromCloud(fileToBeDeleted);
            if (!deletedThumbnail) {
                throw new ApiError(
                    500,
                    "unable to delete old thumbnail from cloud"
                );
            }
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    videoChanges,
                    "Changes applied to the video succesfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            400,
            "only thumbnail,title or description can be updated"
        );
    }
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video-id");
    }
    const video = await Video.findById(videoId);
    await deleteFromCloud(video.videofile.public_id);
    await deleteFromCloud(video.thumbnail.public_id);
    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deletedVideo) {
        throw new ApiError(500, "Unable to delete the video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo, "video deleted succesfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "video Id invalid or the video removed by its owner"
        );
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(500, "Unable to find the video");
    }
    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "toggled publish status succesfully"));
});

export {
    getAllVideosByUser,
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
