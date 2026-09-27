import { PrismaClient } from "@/generated/prisma/client";


const events = [

 {
  key:"auth.otp",
  name:"کد ورود",
  module:"auth",
 },


 {
  key:"auth.login",
  name:"ورود موفق",
  module:"auth",
 },


 {
  key:"payment.success",
  name:"پرداخت موفق",
  module:"payment",
 },


 {
  key:"payment.failed",
  name:"پرداخت ناموفق",
  module:"payment",
 },


 {
  key:"order.created",
  name:"سفارش جدید",
  module:"order",
 },


 {
  key:"subscription.started",
  name:"شروع اشتراک",
  module:"subscription",
 },


 {
  key:"subscription.expiring",
  name:"نزدیک شدن پایان اشتراک",
  module:"subscription",
 },


 {
  key:"subscription.expired",
  name:"پایان اشتراک",
  module:"subscription",
 },


 {
  key:"ticket.created",
  name:"تیکت جدید",
  module:"support",
 },


 {
  key:"ticket.reply",
  name:"پاسخ تیکت",
  module:"support",
 },


 {
  key:"business.created",
  name:"ایجاد کسب‌وکار",
  module:"business",
 },

 {
  key:"custom-service.offer-sent",
  name:"پیشنهاد سرویس اختصاصی",
  module:"custom-service",
 },

];



export async function seedNotificationEvents(
 prisma:PrismaClient
){

 for(const event of events){

  await prisma.notificationEvent.upsert({

   where:{
    key:event.key,
   },

   update:{
    name:event.name,
    module:event.module,
   },

   create:event,

  });

 }

}
