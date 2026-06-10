import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITweet extends Document {
  content: string;
  owner: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const tweetSchema = new Schema<ITweet>(
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

export const Tweet = mongoose.model<ITweet>("Tweet", tweetSchema);
