import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channel id");
    }
    const existingSubscribtion = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id,
    }).lean();

    if (existingSubscribtion) {
        const unsubscribed = await Subscription.findByIdAndDelete(
            existingSubscribtion._id
        ).lean();

        if (!unsubscribed) {
            throw new ApiError(500, "unable to unsubscribe the channel");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    unsubscribed,
                    "channel unsubscribed successfully"
                )
            );
    }

    const subscribed = await Subscription.create({
        channel: channelId,
        subscriber: req.user._id,
    });
    if (!subscribed) {
        throw new ApiError(500, "channel subscriptionsuccessfull");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribed, "channel subscribed successfully")
        );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channel id");
    }
    const allSubscribedUsersDocs = await Subscription.find({
        channel: channelId,
    }).lean();

    const allSubscribedUsers = allSubscribedUsersDocs.map(
        (Subscription) => Subscription.subscriber
    );
    if (!allSubscribedUsers) {
        throw new ApiError(500, "unable to find subscribers of this channel");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allSubscribedUsers,
                "Fetcher all subscribed user"
            )
        );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "subscriber id is invalid");
    }
    const allSubscribedChannelDocs = await Subscription.find({
        subscriber: subscriberId,
    }).lean();

    const allSubscribedChannels = allSubscribedChannelDocs.map(
        (Subscription) => Subscription.channel
    );
    if (!allSubscribedChannels) {
        throw new ApiError(500, "unable to find allsubscribed channels");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allSubscribedChannels,
                "Fetched all user's subscribed channels"
            )
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
