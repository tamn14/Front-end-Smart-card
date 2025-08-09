import type { PaymentRequest } from "./PaymentRequest";

export interface OrdersRequest  {
    orderType ?: string ; 
    totalAmount ?: number ; 
    status ?: string
    address ?: string
    ordersDate ?: Date
    paymentRequest ?: PaymentRequest ; 
    cardId ?:  number ; 
}