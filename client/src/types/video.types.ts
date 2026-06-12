import type { User } from "./user.types";

export interface MediaFile {
  url?: string;
}

export interface Video {
  _id?: string;
  title?: string;
  description?: string;
  createdAt?: string;
  duration?: number;
  thumbnail?: MediaFile;
  videofile?: MediaFile;
  owner?: User | {
    _id?: string;
    avatar?: MediaFile;
    userName?: string;
    fullName?: string;
    isSubscribedByUser?: boolean;
    totalSubscribers?: number;
  };
  views?: number;
  isLiked?: boolean;
  isPublished?: boolean;
  color?: string; // used in some UI placeholders
}
