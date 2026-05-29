import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema(
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

export const View = mongoose.model("View", viewSchema);
