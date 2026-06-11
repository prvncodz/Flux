import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller";
import { verifyJwt } from "../middlewares/auth";

const router: Router = Router();

router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router.get("/stats", getChannelStats);
router.get("/videos", getChannelVideos);

export default router;
