import {
 getPaymentProvider,
} from "./payment-provider-factory";


import {
 getPrismaClient,
} from "@/server/db/prisma";


import {
 PaymentStatus,
} from "@/generated/prisma/client";

import {
 LOCAL_TEST_GATEWAY_ID,
 isLocalTestPaymentEnabled,
} from "./payment-test-mode";



export async function startPayment(input:{
 paymentId:string;
 gatewayId:string;
 callbackUrl:string;
}){


 const prisma =
 getPrismaClient();



 const payment =
 await prisma.payment.findUnique({

  where:{
   id:input.paymentId,
  },

  include:{
   order:true,
  },

 });



 if(!payment){

  throw new Error(
   "پرداخت پیدا نشد"
  );

 }



 const gateway =
  input.gatewayId === LOCAL_TEST_GATEWAY_ID
   ?
   isLocalTestPaymentEnabled()
    ? {
       id:LOCAL_TEST_GATEWAY_ID,
       provider:"local-test",
       config:{},
       enabled:true,
      }
    : null
   : await prisma.paymentGateway.findUnique({

      where:{
       id:input.gatewayId,
      },

     });



 if(
  !gateway ||
  !gateway.enabled
 ){

  throw new Error(
   "درگاه فعال نیست"
  );

 }



 const provider =
 getPaymentProvider(
  gateway.provider,
  gateway.config,
 );



 const result =
 await provider.requestPayment({

  amount:
   payment.amount,


  description:
   `پرداخت سفارش ${payment.order.orderNumber}`,


  callbackUrl:
   input.callbackUrl,


  metadata:{
   orderId:payment.orderId,
   paymentId:payment.id,
  },

 });



 await prisma.payment.update({

  where:{
   id:payment.id,
  },

data:{

  provider:
   gateway.provider,


  providerReference:
   result.authority,


metadata:{
  orderId: payment.orderId,
  paymentId: payment.id,
  gatewayId: gateway.id,
},

  status:
   PaymentStatus.PENDING,

},

 });



 return result;

}
