import type {
 PrismaClient,
} from "../../src/generated/prisma/client";


const templates = [

 {
  eventKey:"auth.otp",
  channel:"sms",
  title:"کد ورود",
  body:
   "کد ورود شما {{otp}} است.",
 },


 {
  eventKey:"payment.success",
  channel:"sms",
  title:"پرداخت موفق",
  body:
   "پرداخت شما با موفقیت انجام شد. مبلغ {{amount}} ریال.",
 },


 {
  eventKey:"payment.failed",
  channel:"sms",
  title:"پرداخت ناموفق",
  body:
   "پرداخت شما ناموفق بود. لطفاً دوباره تلاش کنید.",
 },


 {
  eventKey:"subscription.started",
  channel:"sms",
  title:"شروع اشتراک",
  body:
   "اشتراک {{plan_name}} برای {{business_name}} فعال شد.",
 },


 {
  eventKey:"subscription.expiring",
  channel:"sms",
  title:"پایان نزدیک اشتراک",
  body:
   "اشتراک {{plan_name}} شما تا {{days_left}} روز دیگر تمام می‌شود.",
 },


 {
  eventKey:"ticket.reply",
  channel:"sms",
  title:"پاسخ تیکت",
  body:
   "پاسخ جدیدی برای تیکت شما ثبت شد.",
 },

 {
  eventKey:"custom-service.offer-sent",
  channel:"sms",
  title:"پیشنهاد سرویس اختصاصی",
  body:"{{user_name}} عزیز، پیشنهاد {{offer_title}} برای {{business_name}} در پنل شما آماده بررسی و پرداخت است.",
 },

];



export async function seedNotificationTemplates(
 prisma:PrismaClient,
){

 for(const template of templates){

  await prisma.notificationTemplate.upsert({

   where:{
    eventKey_channel:{
     eventKey:
      template.eventKey,
     channel:
      template.channel,
    },
   },

   update:{
    title:
     template.title,
    body:
     template.body,
   },

   create:{

    ...template,

    variables:{},

   },

  });

 }

}
