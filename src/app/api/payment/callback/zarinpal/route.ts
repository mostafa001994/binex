import {
  NextRequest,
  NextResponse,
} from "next/server";


import {
  getPrismaClient,
} from "@/server/db/prisma";


import {
  getPaymentProvider,
} from "@/server/payments/payment-provider-factory";


import {
  fulfillPaidOrder,
} from "@/server/payments/payment-fulfillment-service";
import { releaseCustomServiceOfferAfterFailedPayment } from "@/server/custom-services/custom-service-service";


import {
  PaymentStatus,
  OrderStatus,
} from "@/generated/prisma/client";



export const dynamic = "force-dynamic";



export async function GET(
 request:NextRequest,
){

 const authority =
  request.nextUrl.searchParams.get(
    "Authority",
  );


 const status =
  request.nextUrl.searchParams.get(
    "Status",
  );



 if(!authority){

  return NextResponse.json(
   {
    success:false,
    message:"پرداخت لغو شد",
   },
   {
    status:400,
   },
  );

 }



 const prisma =
  getPrismaClient();



 const payment =
  await prisma.payment.findFirst({

   where:{
    providerReference:
     authority,
   },

   include:{
    order:true,
   },

  });



 if(!payment){

  return NextResponse.json(
   {
    success:false,
    message:"پرداخت پیدا نشد",
   },
   {
    status:404,
   },
  );

 }

 if(status !== "OK"){
  if(payment.status !== PaymentStatus.SUCCEEDED){
   await prisma.$transaction([
    prisma.payment.update({ where:{ id:payment.id }, data:{ status:PaymentStatus.CANCELED, failureCode:"USER_CANCELED", failureMessage:"پرداخت در درگاه لغو شد." } }),
    prisma.order.update({ where:{ id:payment.orderId }, data:{ status:OrderStatus.CANCELED, canceledAt:new Date() } }),
   ]);
   await releaseCustomServiceOfferAfterFailedPayment(payment.orderId);
  }
  return NextResponse.json({ success:false, message:"پرداخت لغو شد و امکان تلاش دوباره وجود دارد." }, { status:400 });
 }



const gatewayId =
  (payment.metadata as {
    gatewayId?: string;
  })?.gatewayId;


if(!gatewayId){

  throw new Error(
    "شناسه درگاه پرداخت ذخیره نشده است"
  );

}


const gateway =
  await prisma.paymentGateway.findUnique({
   where:{
    id:
      gatewayId,
   },

  });


 if(!gateway){

  throw new Error(
   "درگاه پرداخت پیدا نشد"
  );

 }



 const provider =
  getPaymentProvider(
   gateway.provider,
   gateway.config,
  );



 const verify =
  await provider.verifyPayment({

   amount:
    payment.amount,

   authority,

  });



 if(!verify.success){

  await prisma.$transaction([
   prisma.payment.update({ where:{ id:payment.id }, data:{ status:PaymentStatus.FAILED, failedAt:new Date(), failureCode:"VERIFY_FAILED", failureMessage:"تأیید پرداخت توسط درگاه ناموفق بود." } }),
   prisma.order.update({ where:{ id:payment.orderId }, data:{ status:OrderStatus.PAYMENT_FAILED } }),
  ]);
  await releaseCustomServiceOfferAfterFailedPayment(payment.orderId);


  return NextResponse.json({

   success:false,
   message:"تایید پرداخت ناموفق بود",

  });

 }



 await prisma.$transaction(
 async(tx)=>{


  await tx.payment.update({

   where:{
    id:payment.id,
   },

   data:{

    status:
     PaymentStatus.SUCCEEDED,

    providerPaymentId:
     verify.referenceId,

    paidAt:
     new Date(),

   },

  });



  await tx.order.update({

   where:{
    id:payment.orderId,
   },

   data:{
    status:
     OrderStatus.PAID,

    paidAt:
     new Date(),

   },

  });



 });



 // ساخت subscription + provisioning
 await fulfillPaidOrder(
  payment.orderId,
 );




const appUrl =
 process.env.APP_URL || "http://localhost:3000";


return NextResponse.redirect(
  new URL(
    `/payment/success?orderId=${payment.orderId}`,
    appUrl,
  ),
);
}
