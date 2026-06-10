import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: [true, "content is required to tweet"],
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "user is required to tweet"],
        },
    },
    { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
