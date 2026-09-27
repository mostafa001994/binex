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
 AUTH_COOKIE_NAME,
 getAuthenticatedUser,
} from "@/server/auth/auth-service";


import {
 getNotificationProviderAdapter,
} from "@/server/notifications/providers/provider-factory";




export const dynamic =
"force-dynamic";




export const POST =
withApiHandler(
async(
 request:NextRequest
)=>{


 await getAuthenticatedUser(
  request.cookies.get(
   AUTH_COOKIE_NAME
  )?.value
 );




 const body =
 await request.json();




 const providerName =
 body.provider;



 const config =
 body.config;



 const receiver =
 body.receiver;



 const message =
 body.message ??
 "پیام تست BINIX";





 if(!providerName){

  throw new Error(
   "Provider مشخص نشده"
  );

 }




 const adapter =
 getNotificationProviderAdapter(
  providerName
 );





const result =
 await adapter.send({

  receiver,

  message,

  config,

 });




 if(!result.success){

  throw new Error(
   result.error ??
   "ارسال پیام ناموفق بود"
  );

 }





 return apiSuccess({

  success:true,

  message:
   "پیام با موفقیت ارسال شد",


  providerMessageId:
   result.providerMessageId

 });



});
