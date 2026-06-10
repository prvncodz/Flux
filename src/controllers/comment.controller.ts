import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { userId } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "This video is invalid or removed by the user");
    }
    if (!videoId) {
        throw new ApiError(400, "this video id is undefined ");
    }
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "page number is invalid");
    }
    if (isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "page number is invalid");
    }
    const comments = await Comment.find({ video: videoId })
        .skip(skipNum)
        .limit(limitNum);

    if (!comments) {
        throw new ApiError(500, "Unable to fetch Comments");
    }

    if (!userId) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    comments,
                    "Fetched all comments on this video successfully"
                )
            );
    }

    const promises = comments.map(async (comment) => {
        const obj = comment.toObject();
        obj.isLiked = userId
            ? !!(await Like.exists({ comment: obj._id, likedBy: userId }).lean())
            : false;
        return obj;
    });

    const allCommentsWithLikeStatus = await Promise.all(promises);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allCommentsWithLikeStatus,
                "Fetched all comments on this tweet with like status successfully"
            )
        );
});

const getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { userId } = req.query;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "This tweet is invalid or removed by the user");
    }
    if (!tweetId) {
        throw new ApiError(400, "undefined tweet id");
    }

    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "page number is invalid");
    }
    if (isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "limit number is invalid");
    }
    const comments = await Comment.find({ tweet: tweetId })
        .skip(skipNum)
        .limit(limitNum);

    if (!comments) {
        throw new ApiError(500, "Unable to fetch Comments");
    }
    if (!userId) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    comments,
                    "Fetched all comments on this tweet successfully"
                )
            );
    }
    const promises = comments.map(async (comment) => {
        const obj = comment.toObject();
        obj.isLiked = userId
            ? !!(await Like.exists({ comment: obj._id, likedBy: userId }).lean())
            : false;
        return obj;
    });

    const allCommentsWithLikeStatus = await Promise.all(promises);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allCommentsWithLikeStatus,
                "Fetched all comments on this tweet with like status successfully"
            )
        );
});
const getCommentComments = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.query;
    if (!commentId) {
        throw new ApiError(404, "undefined comment Id");
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(
            400,
            "This comment is invalid or removed by the user"
        );
    }
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "page number is invalid");
    }
    if (isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "limit number is invalid");
    }
    const comments = await Comment.find({ comment: commentId })
        .skip(skipNum)
        .limit(limitNum)
        .lean();

    if (!comments) {
        throw new ApiError(500, "Unable to fetch Comments");
    }
    if (!userId) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    comments,
                    "Fetched all comments on this comment successfully"
                )
            );
    }

    const promises = comments.map(async (comment) => {
        const obj = comment.toObject();
        obj.isLiked = userId
            ? !!(await Like.exists({ comment: obj._id, likedBy: userId }).lean())
            : false;
        return obj;
    });

    const allCommentsWithLikeStatus = await Promise.all(promises);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allCommentsWithLikeStatus,
                "Fetched all comments on this tweet with like status successfully"
            )
        );
});

const addCommentOnVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "This video is invalid or removed by the user");
    }
    const { content } = req.body;
    if (!content) {
        throw new ApiError(
            400,
            "Add content to add to a comment in this video!"
        );
    }
    const addedComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    });
    if (!addedComment) {
        throw new ApiError(500, "Unable to add comment");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, addedComment, "Comment added successfully!")
        );
});

const addCommentOnTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "This tweet is invalid or removed by the user");
    }
    const { content } = req.body;
    if (!content) {
        throw new ApiError(
            400,
            "Add content to add to a comment in this tweet!"
        );
    }
    const addedComment = await Comment.create({
        content,
        tweet: tweetId,
        owner: req.user?._id,
    });
    if (!addedComment) {
        throw new ApiError(500, "Unable to add comment");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, addedComment, "Comment added successfully!")
        );
});

const addCommentOnComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(
            400,
            "This comment is invalid or removed by the user"
        );
    }
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Add content to add a reply to this comment!");
    }
    const addedComment = await Comment.create({
        content,
        comment: commentId,
        owner: req.user?._id,
    });
    if (!addedComment) {
        throw new ApiError(500, "Unable to add comment");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, addedComment, "Comment added successfully!")
        );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { newContent } = req.body;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(
            400,
            "This comment is invalid or removed by the user"
        );
    }
    if (!newContent) {
        throw new ApiError(
            400,
            "new content should be provided to update the comment"
        );
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: newContent,
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(commentId).lean();
    if (!deletedComment) {
        throw new ApiError(500, "Unable to delete your comment");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedComment, "Deleted comment successfully")
        );
});

export {
    getVideoComments,
    addCommentOnVideo,
    updateComment,
    deleteComment,
    getTweetComments,
    getCommentComments,
    addCommentOnTweet,
    addCommentOnComment,
};
