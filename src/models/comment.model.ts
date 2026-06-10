import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IComment extends Document {
    content: string;
    video?: Types.ObjectId;
    tweet?: Types.ObjectId;
    comment?: Types.ObjectId;
    owner: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "owner is required"],
        },
    },
    { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model<IComment>("Comment", commentSchema);
