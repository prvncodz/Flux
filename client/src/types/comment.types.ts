import type { User } from "./user.types";
import type { Video } from "./video.types";

export interface Comment {
  _id?: string;
  owner?: string | User;
  content?: string;
  isLiked?: boolean;
  createdAt?: string;
  replies?: Comment[];
  // some endpoints may return nested data relating this comment to a post/video
  relatedTo?: {
    video?: Video;
    postId?: string;
  };
}
