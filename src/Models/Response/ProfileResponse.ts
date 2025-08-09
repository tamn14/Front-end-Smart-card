import type { MediaFileResponse } from "./MediaFileResponse";
import type { UserResponse } from "./UserResponse";

export interface ProfileResponse {
  profileId: number;
  summary?: string;
  hobby?: string[];
  website?: string[];
  userResponse?: UserResponse,
  mediaFileResponse?: MediaFileResponse[]
}
