

export type NotificationEventDefinition = {

 key:string;

 name:string;

 module:string;

 description:string;

 variables:string[];

};



export const NOTIFICATION_EVENTS:
NotificationEventDefinition[] = [


{

 key:"auth.otp",

 name:"کد ورود",

 module:"احراز هویت",

 description:"ارسال کد یکبار مصرف ورود",

variables:[
 "otp",
 "expire_minutes",
 "user_name",
 "phone",
 "app_name",
],

},



{

 key:"payment.success",

 name:"پرداخت موفق",

 module:"پرداخت",

 description:"بعد از پرداخت موفق",

variables:[
 "amount",
 "invoice_id",
 "user_name",
 "phone",
 "app_name",
],


},



{

 key:"subscription.expiring",

 name:"نزدیک شدن پایان اشتراک",

 module:"اشتراک",

 description:"هشدار پایان اشتراک",

variables:[
 "user_name",
 "phone",
 "plan_name",
 "days_left",
 "expire_date",
 "app_name",
],
},



{

 key:"subscription.expired",

 name:"پایان اشتراک",

 module:"اشتراک",

 description:"اشتراک منقضی شده",

variables:[
 "user_name",
 "phone",
 "plan_name",
 "app_name",
],
},



{

 key:"ticket.reply",

 name:"پاسخ تیکت",

 module:"پشتیبانی",

 description:"پاسخ جدید پشتیبانی",

variables:[
 "user_name",
 "phone",
 "ticket_id",
 "message",
 "app_name",
],
},



{

 key:"order.created",

 name:"ثبت سفارش",

 module:"فروش",

 description:"ایجاد سفارش جدید",

variables:[
 "user_name",
 "phone",
 "order_id",
 "amount",
 "app_name",
],
},

{
 key:"custom-service.offer-sent",
 name:"پیشنهاد سرویس اختصاصی",
 module:"سرویس اختصاصی",
 description:"پس از ارسال پیشنهاد اختصاصی برای مالک کسب‌وکار",
 variables:["user_name", "phone", "offer_title", "business_name", "app_name"],
},


];



export function getNotificationEvent(
 key:string,
){

 return NOTIFICATION_EVENTS.find(
  x=>x.key===key
 )
 ?? null;

}
