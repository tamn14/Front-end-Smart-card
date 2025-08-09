import type { MediaFileResponse } from "./MediaFileResponse";
import type { UserResponse } from "./UserResponse";

export interface ProjectResponse {
  projectId: number;
  title?: string;
  description?: string;
  userResponse?: UserResponse;
  mediaFileResponse?: MediaFileResponse[]
}
