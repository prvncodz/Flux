import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller";
import { verifyJwt } from "../middlewares/auth";

const router: Router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router.get("/s/:subscriberId", getSubscribedChannels);
router.post("/c/:channelId", toggleSubscription);

router.get("/user/:channelId/subscribers", getUserChannelSubscribers);

export default router;
