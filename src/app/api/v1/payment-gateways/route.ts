import {
  apiSuccess,
} from "@/server/core/api-response";

import {
  withApiHandler,
} from "@/server/core/route-handler";

import {
  getPrismaClient,
} from "@/server/db/prisma";

import type {
 NextRequest,
} from "next/server";

import {
 LOCAL_TEST_GATEWAY_ID,
 isLocalRealPaymentEnabled,
 isLocalTestPaymentRequest,
} from "@/server/payments/payment-test-mode";


export const dynamic = "force-dynamic";



export const GET =
withApiHandler(
async(request:NextRequest)=>{


 const gateways =
 await getPrismaClient()
 .paymentGateway
 .findMany({

  where:{
   enabled:true,
  },


  orderBy:[
   {
    priority:"asc",
   },

   {
    createdAt:"desc",
   },

  ],




select:{

 id:true,

 name:true,

 slug:true,

 provider:true,

 logoUrl:true,

},



 });



 const availableGateways =
 isLocalTestPaymentRequest(
   request.url,
   request.headers.get("host"),
  )
   ? [
      {
       id:LOCAL_TEST_GATEWAY_ID,
       name:"درگاه آزمایشی محلی",
       slug:"local-test",
       provider:"local-test",
       logoUrl:null,
      },
      ...(isLocalRealPaymentEnabled()
       ? gateways.filter((gateway) => gateway.provider === "zarinpal")
       : []),
     ]
   : gateways;


 return apiSuccess({

  gateways:availableGateways,

 });


});
