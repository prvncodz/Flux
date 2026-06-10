import { Router } from "express";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    getAllTweets,
} from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middlewares/auth.js";

const router = Router();
// Apply verifyJwt middleware to all routes in this file exept get all tweets
router.get("/get-all-tweets", getAllTweets);
router.post("/create-tweet", verifyJwt, createTweet);
router.get("/:userId", getUserTweets);
router.patch("/:tweetId/update-tweet", verifyJwt, updateTweet);

router.delete("/:tweetId/delete-tweet", verifyJwt, deleteTweet);

export default router;
