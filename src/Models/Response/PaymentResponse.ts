export interface PaymentResponse {
  payId: number;
  method?: string;
  status?: string;
  payDate?: Date;
}