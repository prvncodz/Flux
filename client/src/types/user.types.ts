import type { Video } from "./video.types";

export interface Avatar {
  url?: string;
}

export interface User {
  _id?: string;
  userName?: string;
  fullName?: string;
  email?: string;
  avatar?: Avatar;
  coverImage?: Avatar;
  isSubscribed?: boolean; // generic flag used in various endpoints
  isSubscribedByUser?: boolean; // when returned as owner metadata for a resource
  totalSubscribers?: number;
  subscriberCount?: number;
  channelsSubscribedCount?: number;
  watchHistory?: Array<string | Video>;
}
