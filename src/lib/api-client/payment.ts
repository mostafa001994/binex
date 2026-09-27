export async function startPaymentApi(
 input:{
  paymentId:string;
  gatewayId:string;
 }
){

 const response =
 await fetch(
  "/api/v1/payments/create",
  {
   method:"POST",
   credentials:"include",
   headers:{
    "Content-Type":"application/json",
   },
   body:JSON.stringify({
    paymentId:
     input.paymentId,

    gatewayId:
     input.gatewayId,
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
   payload?.error?.message ||
   "شروع پرداخت ناموفق بود"
  );

 }


 return payload.data as {
  paymentUrl:string;
 };

}


export async function createPaymentApi(input:{
  planId:string;
  gatewayId:string;
}){

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
          planId:input.planId,
          gatewayId:input.gatewayId,
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
      payload?.error?.message ||
      "ایجاد پرداخت ناموفق بود"
    );
  }


  return payload.data as {
    checkout: {
      authority: string;
      paymentUrl: string;
    };
  };

}
