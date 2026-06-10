import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPlaylist extends Document {
  name: string;
  description?: string;
  videos: Types.ObjectId[];
  owner: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const playlistSchema = new Schema<IPlaylist>(
  {
    name: {
      type: String,
      required: [true, "name is required to create a playlist"],
    },

    description: {
      type: String,
    },

    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required to create a playlist"],
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model<IPlaylist>("Playlist", playlistSchema);
