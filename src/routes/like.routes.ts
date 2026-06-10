import { Router } from "express";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getTweetLikesCount,
    getVideoLikesCount,
    getCommentLikesCount,
} from "../controllers/like.controller.js";
import { verifyJwt } from "../middlewares/auth.js";

const router: Router = Router();
// Apply verifyJWT middleware to all routes in this file

router.post("/toggle/v/:videoId", verifyJwt, toggleVideoLike);
router.post("/toggle/c/:commentId", verifyJwt, toggleCommentLike);
router.post("/toggle/t/:tweetId", verifyJwt, toggleTweetLike);
router.get("/videos", verifyJwt, getLikedVideos);
router.get("/t/:tweetId", getTweetLikesCount);
router.get("/v/:videoId", getVideoLikesCount);
router.get("/c/:commentId", getCommentLikesCount);
export default router;
