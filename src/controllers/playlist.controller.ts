import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        throw new ApiError(400, "name field is required to create a playlist");
    }

    const createdPlaylist = await Playlist.create({
        name,
        description: description ? description : "",
        owner: req.user._id,
    });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                createdPlaylist,
                "playlist created successfully"
            )
        );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "invlaid user id");
    }
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const skipNum = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "page number invalid");
    }
    if (isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "limit is invalid");
    }
    const AllPlaylistsByUser = await Playlist.find({ owner: userId })
        .skip(skipNum)
        .limit(limitNum)
        .lean()
        .populate("videos", "thumbnail")
        .populate("owner", "avatar fullName userName");

    if (!AllPlaylistsByUser) {
        throw new ApiError(500, "unable to find playlist of this user");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                AllPlaylistsByUser,
                "Fetched all playlists by user"
            )
        );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invlaid id");
    }
    const playlist = await Playlist.findById(playlistId)
        .lean()
        .populate("videos")
        .populate("owner", "avatar fullName userName");
    if (!playlist) {
        throw new ApiError(500, "unable to find this playlist");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "fetched playlist successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "inavlid id");
    }
    const { videoIds } = req.body;
    if (!videoIds) {
        throw new ApiError(
            400,
            "Atleast one video is required to add video to playlist"
        );
    }
    const addedVideoToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoIds,
            },
        },
        { returnDocument:"after" }
    ).lean();
    if (!addedVideoToPlaylist) {
        throw new ApiError("unable to add videos to the playlist");
    }
    const newPlaylist = await Playlist.findById(playlistId).lean().populate("videos");
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newPlaylist,
                "Videos added to the playlist successfully"
            )
        );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "inavlid id");
    }
    const removeVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId,
            },
        },
        { returnDocument:"after" }
    ).lean();
    if (!removeVideo) {
        throw new ApiError(500, "unable to remove this video from playlist");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                removeVideo,
                "Video removed from playlist successfully"
            )
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invlaid id");
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId).lean();
    if (!deletedPlaylist) {
        throw new ApiError(500, "unable to delete palylist");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "deleted this Playlist successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invlaid id");
    }
    if (!name) {
        throw new ApiError(400, "name is required to update the playlist");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description: description ? description : "",
            },
        },
        { returnDocument: "after"}
    ).lean();

    if (!updatedPlaylist) {
        throw new ApiError(500, "unable to update the playlist");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "updated playlist info successfully"
            )
        );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
