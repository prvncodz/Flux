import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubscription extends Document {
    subscriber: Types.ObjectId;
    channel: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "subscriber is required"],
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "channel is required"],
        },
    },
    { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>("Subscription", subscriptionSchema);
