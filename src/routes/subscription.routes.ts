import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.js";

const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router.get("/s/:subscriberId", getSubscribedChannels);
router.post("/c/:channelId", toggleSubscription);

router.get("/user/:channelId/subscribers", getUserChannelSubscribers);

export default router;
