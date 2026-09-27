export async function createPaymentCheckoutApi(
 planId:string,
){

 const response =
 await fetch(
  "/api/v1/payments/checkout",
  {
   method:"POST",
   credentials:"include",
   headers:{
    "Content-Type":"application/json",
   },
   body:JSON.stringify({
    planId,
   }),
  }
 );


 const payload =
 await response.json();


 if(
  !response.ok ||
  !payload.success
 ){

  throw new Error(
   payload.error?.message ||
   "ایجاد پرداخت انجام نشد"
  );

 }


 return payload.data as {

  checkout:{
   paymentId:string;
   orderId:string;
   amount:string;
   currency:string;
  };

 };

}
