import mongoose, { Schema, Document, Types } from "mongoose";

export interface IView extends Document {
    videoId: Types.ObjectId;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const viewSchema = new Schema<IView>(
    {
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: [true, "videoId is required to add a view"],
        },
        userId: {
            type: String,
            required: [true, "userId is required to add a view"],
        },
    },
    { timestamps: true }
);

export const View = mongoose.model<IView>("View", viewSchema);
