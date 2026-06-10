import { Router } from "express";
import {
    addCommentOnVideo,
    deleteComment,
    getVideoComments,
    updateComment,
    getTweetComments,
    getCommentComments,
    addCommentOnTweet,
    addCommentOnComment,
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.js";

const router = Router();

router.get("/:videoId/get-video-comments", getVideoComments);

router.get("/:tweetId/get-tweet-comments", getTweetComments);

router.get("/:commentId/get-comment-comments", getCommentComments);

router.post("/v/:videoId/add-comment", verifyJwt, addCommentOnVideo);

router.post("/c/:commentId/add-comment", verifyJwt, addCommentOnComment);

router.post("/t/:tweetId/add-comment", verifyJwt, addCommentOnTweet);

router.patch("/:commentId/update-comment", verifyJwt, updateComment);

router.delete("/:commentId/delete-comment", verifyJwt, deleteComment);

export default router;
