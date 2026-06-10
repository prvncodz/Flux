import { Request, Response } from "express";
import { isValidObjectId, Types } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";

type AuthRequest = Request & { user?: { _id?: Types.ObjectId | string } };

const toggleVideoLike = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "object id invalid");
    }
    const video = await Video.findById(videoId);
    if (!video?.isPublished) {
        throw new ApiError(
            400,
            "this video is unpublished unable to like the video"
        );
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id,
    }).lean();

    if (existingLike) {
        const disliked = await Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(
                new ApiResponse(200, disliked, "video disliked successfully")
            );
    }

    const liked = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });
    if (!liked) {
        throw new ApiError(500, "unable to like the video");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, liked, "video liked successfully!"));
});

const toggleCommentLike = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "object id invalid");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    }).lean();

    if (existingLike) {
        const disliked = await Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(
                new ApiResponse(200, disliked, "Comment disliked successfully")
            );
    }

    const liked = await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });
    if (!liked) {
        throw new ApiError(500, "unable to like the comment");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, liked, "Comment liked successfully!"));
});

const toggleTweetLike = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "object id invalid");
    }
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    }).lean();

    if (existingLike) {
        const disliked = await Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(
                new ApiResponse(200, disliked, "tweet disliked successfully")
            );
    }

    const liked = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });
    if (!liked) {
        throw new ApiError(500, "unable to like the tweet");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, liked, "tweet liked successfully!"));
});

const getLikedVideos = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { page = '1', limit = '10', userId } = req.query as Record<string, string | undefined>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "page number is invalid");
    }
    if (isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "page number is invalid");
    }
    const skipNum = (pageNum - 1) * limitNum;
    const allLikedVideoIds = await Like.find({ likedBy: req.user?._id }) //got all the video ids where user has liked
        .select("video");

    const videos = await Video.find({
        //got the needed videos with the help of this videoIds
        _id: { $in: allLikedVideoIds.map((d) => d.video) },
    })
        .lean()
        .skip(skipNum)
        .limit(limitNum)
        .populate("owner", "avatar fullName");

    if (!videos) {
        throw new ApiError(500, "Unable to get all liked videos");
    }

    const promises = videos.map(async (video) => {
        const obj = { ...video };
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
        .json(
            new ApiResponse(
                200,
                allVideos,
                "fetched all liked videos successfully"
            )
        );
});
const getTweetLikesCount = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    let likesCount = 0;
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(400, "Invalid tweet Id");
    }
    likesCount = await Like.countDocuments({ tweet: tweetId });
    if (likesCount === undefined || likesCount === null) {
        throw new ApiError(500, "cannot find the like docs for this tweet");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likesCount,
                "Tweet's like count successfully fetched"
            )
        );
});

const getVideoLikesCount = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    let likesCount = 0;
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Invalid video Id");
    }

    likesCount = await Like.countDocuments({ video: videoId });
    if (likesCount === undefined || likesCount === null) {
        throw new ApiError(500, "cannot find the like docs for this video");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likesCount,
                "Video's like count successfully fetched"
            )
        );
});
const getCommentLikesCount = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    let likesCount = 0;
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "Invalid comment Id");
    }
    likesCount = await Like.countDocuments({ comment: commentId });
    if (likesCount === undefined || likesCount === null) {
        throw new ApiError(500, "cannot find the like docs for this comment");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likesCount,
                "Comment's like count successfully fetched"
            )
        );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getTweetLikesCount,
    getVideoLikesCount,
    getCommentLikesCount,
};
