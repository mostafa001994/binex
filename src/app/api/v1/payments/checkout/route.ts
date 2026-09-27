import type {
 NextRequest,
} from "next/server";


import {
 AUTH_COOKIE_NAME,
 getAuthenticatedUser,
} from "@/server/auth/auth-service";


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
 resolvePaymentCallbackUrl,
} from "@/server/payments/payment-test-mode";
import {
 ValidationApiError,
} from "@/server/core/api-error";



export const dynamic="force-dynamic";



export const POST =
withApiHandler(
async(
 request:NextRequest,
)=>{


 const user =
 await getAuthenticatedUser(
  request.cookies.get(
   AUTH_COOKIE_NAME,
  )?.value,
 );



 const body =
 await request.json().catch(() => ({}));

 if(
  typeof body.planId !== "string" ||
  !body.planId ||
  typeof body.gatewayId !== "string" ||
  !body.gatewayId
 ){
  throw new ValidationApiError("پلن و درگاه پرداخت باید انتخاب شوند.");
 }



const result =
 await createPaymentCheckout({

  user,

  planId:
    body.planId,

  gatewayId:
    body.gatewayId,

callbackUrl:
 resolvePaymentCallbackUrl(
  request.url,
  body.gatewayId,
  request.headers.get("host"),
 ),

});


 return apiSuccess({

  checkout:result,

 });


});
