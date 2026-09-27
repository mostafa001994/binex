import type { NextRequest } from "next/server";


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
 updateAdminNotificationProvider,
 deleteAdminNotificationProvider,
} from "@/server/admin/admin-notification-provider-service";



export const dynamic="force-dynamic";



export async function PATCH(
 request:NextRequest,
 context:{
  params:Promise<{
   providerId:string
  }>
 }
){


 return withApiHandler(
 async(req)=>{


 const user =
 await getAuthenticatedUser(
  req.cookies.get(AUTH_COOKIE_NAME)?.value
 );


 const {
  providerId,
 } =
 await context.params;


 const body =
 await req.json()
 .catch(()=>({}));


 return apiSuccess({
  provider:
   await updateAdminNotificationProvider(
    user,
    providerId,
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
   providerId:string
  }>
 }
){


 return withApiHandler(
 async(req)=>{


 const user =
 await getAuthenticatedUser(
  req.cookies.get(AUTH_COOKIE_NAME)?.value
 );


 const {
  providerId,
 } =
 await context.params;


 return apiSuccess(
  await deleteAdminNotificationProvider(
   user,
   providerId,
  )
 );


 }
 )(request);


}
