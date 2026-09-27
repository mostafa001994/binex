export type PaymentGateway = {

 id:string;

 name:string;

 slug:string;

 provider:string;

 logoUrl:string|null;

};



type ErrorPayload = {

 success:false;

 error:{
  message:string;
 };

};



export async function getPaymentGatewaysApi(){

 const response =
 await fetch(
  "/api/v1/payment-gateways",
  {
   method:"GET",
   credentials:"include",
   headers:{
    Accept:"application/json",
   },
  }
 );


 const payload =
 await response.json();


 if(
  !response.ok ||
  !payload.success
 ){

  throw new Error(
   (payload as ErrorPayload)
    .error?.message ||
   "دریافت درگاه‌های پرداخت ناموفق بود."
  );

 }


 return payload.data as {

  gateways:PaymentGateway[];

 };

}
