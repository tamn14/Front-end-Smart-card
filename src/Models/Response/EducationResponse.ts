import type { MediaFileResponse } from "./MediaFileResponse";
import type { UserResponse } from "./UserResponse";

export interface EducationResponse {
    eduId : number ; 
    schoolName ?: string ; 
    degree ?: string ; 
    startDate ?: Date ; 
    endDate ?: Date ; 
    description ?: string  ; 
    userResponse ?: UserResponse ; 
    mediaFileResponse ?: MediaFileResponse[] 

}