import type { MediaFileResponse } from "./MediaFileResponse"
import type { UserResponse } from "./UserResponse"

export interface ExperiencesResponse {
    exId : number ;
    name ?: string ;
    position  ?: string ;
    description ?: string ;
    startDate ?: Date ;
    endDate ?: Date
    userResponse ?: UserResponse ; 
    mediaFileResponse ?: MediaFileResponse[] 
}