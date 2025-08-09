import type { CardResponse } from "./CardResponse";
import type { UserResponse } from "./UserResponse";

export interface OrdersResponse {
    orderId : number ; 
    ordersType ?: String ;
    totalAmount ?: number ; 
    status ?: string ; 
    address ?: string ; 
    ordersDate ?: Date ; 

    paymentResponse ?: PaymentResponse ; 
    userResponse ?: UserResponse ;  
    cardResponse ?: CardResponse 
}