import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMediaFile {
  url: string;
  public_id: string;
}

export interface IVideo extends Document {
  videofile: IMediaFile;
  thumbnail: IMediaFile;
  owner?: Types.ObjectId;
  description?: string;
  title: string;
  duration: number;
  views: number;
  isLiked?: boolean;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    videofile: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    thumbnail: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: [true, "title is required"],
    },
    duration: {
      type: Number,
      required: [true, "video should have a duration"],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
export const Video = mongoose.model<IVideo>("Video", videoSchema);
