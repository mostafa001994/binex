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
 updateAdminNotificationEvent,
 deleteAdminNotificationEvent,
} from "@/server/admin/admin-notification-event-service";



export const dynamic="force-dynamic";



export async function PATCH(
 request:NextRequest,
 context:{
  params:Promise<{
   eventId:string;
  }>;
 }
){


 return withApiHandler(
 async(req)=>{


 const user =
 await getAuthenticatedUser(
  req.cookies.get(AUTH_COOKIE_NAME)?.value
 );


 const {
  eventId,
 } =
 await context.params;



 const body =
 await req.json()
 .catch(()=>({}));



 return apiSuccess({

 event:
 await updateAdminNotificationEvent(
  user,
  eventId,
  body,
 ),

 });


 }
 )(request);


}





export async function DELETE(
 request:NextRequest,
 context:{
  params:Promise<{
   eventId:string;
  }>;
 }
){


 return withApiHandler(
 async(req)=>{


 const user =
 await getAuthenticatedUser(
  req.cookies.get(AUTH_COOKIE_NAME)?.value
 );


 const {
  eventId,
 } =
 await context.params;



 return apiSuccess(

 await deleteAdminNotificationEvent(
  user,
  eventId,
 )

 );


 }
 )(request);


}
