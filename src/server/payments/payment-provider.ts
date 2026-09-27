export type PaymentRequestInput = {

  amount: bigint;

  description:string;

  callbackUrl:string;

  metadata?:Record<string,unknown>;

};



export type PaymentRequestResult = {

  authority:string;

  paymentUrl:string;

};



export type PaymentVerifyInput = {

  authority:string;

  amount:bigint;

};



export type PaymentVerifyResult = {

  success:boolean;

  referenceId?:string;

};



export interface PaymentProvider {


  requestPayment(
    input:PaymentRequestInput
  ):Promise<PaymentRequestResult>;



  verifyPayment(
    input:PaymentVerifyInput
  ):Promise<PaymentVerifyResult>;


}
