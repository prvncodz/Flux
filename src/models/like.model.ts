import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILike extends Document {
  comment?: Types.ObjectId;
  video?: Types.ObjectId;
  tweet?: Types.ObjectId;
  likedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const likeSchema = new Schema<ILike>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model<ILike>("Like", likeSchema);
