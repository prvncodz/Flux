import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessTokens,
    changePassword,
    currentUser,
    updateAccountInfo,
    updateUserAvatar,
    updateUserCoverImage,
    showUserProfile,
    getWatchHistory,
    getUserById,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/auth.js";

const router: Router = Router();
router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);
router.get("/c/:userId", getUserById);
router.post("/login", loginUser);

//secured routes
router.post("/logout", verifyJwt, logoutUser);
router.post("/refresh-tokens", refreshAccessTokens);
router.post("/change-password", verifyJwt, changePassword);
router.get("/current-user", verifyJwt, currentUser);

router.patch("/update-user-info", verifyJwt, updateAccountInfo);
router.patch(
    "/update-user-avatar",
    verifyJwt,
    upload.single("avatar"),
    updateUserAvatar
);
router.patch(
    "/update-user-coverimage",
    verifyJwt,
    upload.single("coverImage"),
    updateUserCoverImage
);

router.get("/p/:username", showUserProfile);
router.get("/user-watch-history", verifyJwt, getWatchHistory);

export default router;
