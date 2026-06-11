import { Request, Response } from "express";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

const getChannelStats = asyncHandler(async (req: Request, res: Response)=> {
    const dashboard = await User.aggregate([
        {
            $match: {
                _id: req?.user?._id,
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "allVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "allLikes",
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $addFields: {
                totalViews: { $sum: "$allVideos.views" },
                totalSubscribers: { $size: "$subscribers" },
                totalVideosCount: { $size: "$allVideos" },
                totalLikes: {
                    $sum: {
                        $map: {
                            input: "$allVideos",
                            as: "video",
                            in: {
                                $size: {
                                    $ifNull: ["$$video.allLikes", []],
                                },
                            },
                        },
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                avatar: 1,
                coverImage: 1,
                totalSubscribers: 1,
                totalVideosCount: 1,
                totalLikes: 1,
                totalViews: 1,
            },
        },
    ]);
    if (!dashboard?.length) {
        throw new ApiError(500, "unable to fetch all stats of the channel");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                dashboard,
                "Fetched all stats of the channel successfully"
            )
        );
});

const getChannelVideos = asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '10' } = req.query as Record<string, string | undefined>;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;
    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "page number is invalid");
    }
    if (isNaN(limitNum) || limitNum < 1) {
        throw new ApiError(400, "limit number is invalid");
    }

    const allVideos = await Video.find({ owner: req?.user?._id })
        .skip(skipNum)
        .limit(limitNum)
        .lean();

    if (!allVideos) {
        throw new ApiError(500, "Unable to fetch all channel videos");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allVideos,
                "All channel video fetched successfully"
            )
        );
});

export { getChannelStats, getChannelVideos };
