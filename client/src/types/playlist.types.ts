import type { Video } from "./video.types";
import type { User } from "./user.types";

export interface Playlist {
  _id?: string;
  name?: string;
  description?: string;
  owner?: string | User;
  videos?: Video[];
}
