import type {
 NextRequest,
} from "next/server";


import {
 apiSuccess,
} from "@/server/core/api-response";


import {
 withApiHandler,
} from "@/server/core/route-handler";


import {
 createPaymentCheckout,
} from "@/server/payments/payment-checkout-service";


import {
 AUTH_COOKIE_NAME,
 getAuthenticatedUser,
} from "@/server/auth/auth-service";


export const dynamic="force-dynamic";



export const POST =
withApiHandler(
async(
 request:NextRequest,
)=>{


 const body =
 await request.json();



const user =
 await getAuthenticatedUser(
  request.cookies.get(
   AUTH_COOKIE_NAME,
  )?.value,
 );


const result =
 await createPaymentCheckout({

  user,

  planId:
   body.planId,


  gatewayId:
   body.gatewayId,


  callbackUrl:
   `${process.env.APP_URL}/payment/callback`,

});


 return apiSuccess({

  paymentUrl:
   result.paymentUrl,

 });


});
