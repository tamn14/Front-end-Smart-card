import type { MediaFileResponse } from "./MediaFileResponse";
import type { UserResponse } from "./UserResponse";

export interface SkillResponse {
  skillId: number;
  name?: string;
  level?: number;
  userResponse?: UserResponse;
  mediaFileResponse?: MediaFileResponse[]
}
