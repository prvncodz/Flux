import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verifyJwt } from "../middlewares/auth.js";

const router = Router();

router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router.get("/stats", getChannelStats);
router.get("/videos", getChannelVideos);

export default router;
