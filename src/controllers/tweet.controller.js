import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        throw ApiError(400, "You forgot to add content for tweet :)");
    }
    const createdTweet = await Tweet.create({
        content,
        owner: req.user._id,
    });
    if (!createdTweet) {
        throw new ApiError(500, "unable to create tweet");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, createdTweet, "created a tweet"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "page number invalid");
    }
    if (isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "limit is invalid");
    }
    if (!userId) {
        throw new ApiError(404, "userId is undefined");
    }
    const allTweets = await Tweet.find({ owner: userId })
        .skip(skipNum)
        .limit(limitNum)
        .lean()
        .populate("owner", "avatar fullName userName");

    if (!allTweets) {
        throw new ApiError(-501, "error finding tweets by this user");
    }
    const promises = allTweets.map(async (tweet) => {
        const obj = tweet.toObject();
        obj.isLiked = !!(await Like.exists({
            tweet: tweet?._id,
            likedBy: userId,
        }).lean());
        return obj;
    });

    const allTweetWithLikeStatus = await Promise.all(promises);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allTweetWithLikeStatus,
                "All tweets of user fetched successfully"
            )
        );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Add content to update tweet");
    }
    if (!tweetId) {
        throw new ApiError(
            400,
            "tweetId is expired or tweet is deleted by its user"
        );
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content,
            },
        },
        { returnDocument:"after" }
    );
    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "updated tweet successfully"));
});
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(
            400,
            "tweetId is expired or tweet is deleted by its user"
        );
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
        throw new ApiError(500, "unable to deleted this tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedTweet, "tweet deleted successfully"));
});

const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, userId } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;
    if (pageNum < 1 || isNaN(pageNum)) {
        throw new ApiError(500, "Invalid page number");
    }
    if (limitNum < 1 || isNaN(limitNum)) {
        throw new ApiError(500, "Invalid limit is given to the page");
    }
    const filter = {};
    if (query) {
        filter.content = { $regex: query, $options: "i" };
    }

    const allTweets = await Tweet.find(filter)
        .skip(skipNum)
        .limit(limitNum)
        .lean()
        .populate("owner", "avatar fullName userName");

    if (!allTweets) {
        throw new ApiError(500, "Unable to fetch records from database");
    }

    const promises = allTweets.map(async (tweet) => {
        const obj = tweet.toObject();
        obj.isLiked = userId
            ? !!(await Like.exists({ tweet: tweet?._id, likedBy: userId }).lean())
            : false;
        return obj;
    });
    const allTweetWithLikeStatus = await Promise.all(promises);
    if (!allTweetWithLikeStatus) {
        throw new ApiError(500, "unable to add like status to tweet");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allTweetWithLikeStatus,
                "fetched tweets feed successfully"
            )
        );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet, getAllTweets };
