import { Router } from "express";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller";
import { verifyJwt } from "../middlewares/auth";

const router: Router = Router();

router.post("/create", verifyJwt, createPlaylist);

router.get("/:playlistId", getPlaylistById);
router.patch("/:playlistId", verifyJwt, updatePlaylist);
router.delete("/:playlistId", verifyJwt, deletePlaylist);

router.patch("/add/:playlistId", verifyJwt, addVideoToPlaylist);
router.patch(
    "/remove/:videoId/:playlistId",
    verifyJwt,
    removeVideoFromPlaylist
);

router.get("/user/:userId", getUserPlaylists);

export default router;
