import crypto from "node:crypto";

import {
  OrderItemType,
  OrderStatus,
  PaymentStatus,
  PlanStatus,
  ServiceAvailability,
  ServiceCatalogStatus,
  ServiceVisibility,
} from "@/generated/prisma/client";

import {
  getPrismaClient,
} from "@/server/db/prisma";

import type {
  AuthUser,
} from "@/server/auth/auth-types";

import {
  requireBusinessActive,
} from "@/server/business/business-access";

import {
  getCurrentBusinessContext,
} from "@/server/business/business-service";
import {
  ForbiddenApiError,
  NotFoundApiError,
  ValidationApiError,
} from "@/server/core/api-error";


import {
  startPayment,
} from "./payment-service";



export async function createPaymentCheckout(
 input:{
  user:AuthUser;
  planId:string;
  gatewayId:string;
  callbackUrl:string;
 }
){


 const context =
  requireBusinessActive(
   await getCurrentBusinessContext(
    input.user
   ),
  );

 if(context.membership.role !== "owner"){
  throw new ForbiddenApiError(
   "فقط مالک کسب‌وکار می‌تواند اشتراک خریداری کند.",
  );
 }


 const business =
  context.business;



 const prisma =
  getPrismaClient();



 const plan =
 await prisma.servicePlan.findUnique({

  where:{
   id:input.planId,
  },

  include:{
   service:true,
  },

 });



 if(!plan){
  throw new NotFoundApiError("پلن پیدا نشد.");
 }

 if(
  plan.status !== PlanStatus.ACTIVE ||
  !plan.isPublic ||
  plan.priceAmount <= 0n ||
  plan.service.status !== ServiceCatalogStatus.ACTIVE ||
  plan.service.visibility !== ServiceVisibility.PUBLIC ||
  plan.service.availability !== ServiceAvailability.AVAILABLE
 ){
  throw new ValidationApiError("این پلن در حال حاضر قابل خرید نیست.");
 }



 const orderId =
  crypto.randomUUID();



 const paymentId =
  crypto.randomUUID();



 await prisma.$transaction(
 async(tx)=>{


  await tx.order.create({

   data:{


    id:
     orderId,


    orderNumber:
     `BX-${Date.now()}`,


    createdByUserId:
     input.user.id,


    businessId:
     business.id,


    status:
     OrderStatus.PENDING_PAYMENT,


    currency:
     plan.currency,


    subtotalAmount:
     plan.priceAmount,


    discountAmount:
     0n,


    taxAmount:
     0n,


    totalAmount:
     plan.priceAmount,

   },

  });



  await tx.orderItem.create({

   data:{


    orderId,


    serviceId:
     plan.serviceId,


    planId:
     plan.id,


    type:
     OrderItemType.NEW_SUBSCRIPTION,


    serviceNameSnapshot:
     plan.service.name,


    planCodeSnapshot:
     plan.code,


    planNameSnapshot:
     plan.name,


    billingPeriodSnapshot:
     plan.billingPeriod,


    customDurationDays:
     plan.customDurationDays,


    unitAmount:
     plan.priceAmount,


    quantity:
     1,


    totalAmount:
     plan.priceAmount,


   },

  });



await tx.payment.create({

 data:{

  id:
   paymentId,

  orderId,

  provider:
   "zarinpal",

  idempotencyKey:
   `checkout-${paymentId}`,

  amount:
   plan.priceAmount,

  currency:
   plan.currency,

  status:
   PaymentStatus.PENDING,

 },

});


 });



 const paymentResult =
 await startPayment({

  paymentId,

  gatewayId:
   input.gatewayId,

  callbackUrl:
   input.callbackUrl,

 });



 return paymentResult;


}
