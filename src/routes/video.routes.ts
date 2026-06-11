import { Router } from "express";
import {
    deleteVideo,
    getAllVideos,
    getAllVideosByUser,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller";
import { verifyJwt } from "../middlewares/auth";
import { upload } from "../middlewares/multer";
import { verifyJwtOptional } from "../middlewares/optionalAuth";
import { ensureVisitor } from "../middlewares/ensureVisiter";

const router: Router = Router();

router.get("/all-videos-by-user", getAllVideosByUser);

router.get("/all-videos", getAllVideos);

router.post(
    "/publish-video",
    upload.fields([
        { name: "videofile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    verifyJwt,
    publishAVideo
);

router.get("/c/:videoId", verifyJwtOptional, ensureVisitor, getVideoById);

router.patch(
    "/c/:videoId/update-video",
    upload.single("thumbnail"),
    verifyJwt,
    updateVideo
);

router.delete("/c/:videoId/delete-video", verifyJwt, deleteVideo);

router.post(
    "/c/:videoId/toggle-publish-status",
    verifyJwt,
    togglePublishStatus
);

export default router;
