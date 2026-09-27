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
 updateAdminNotificationTemplate,
 deleteAdminNotificationTemplate,
} from "@/server/admin/admin-notification-template-service";


export const dynamic="force-dynamic";



export async function PATCH(
 request:NextRequest,
 context:{
  params:Promise<{
   templateId:string
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
  templateId,
 } =
 await context.params;


 const body =
 await req.json()
 .catch(()=>({}));


 return apiSuccess({

  template:
   await updateAdminNotificationTemplate(
    user,
    templateId,
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
   templateId:string
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
  templateId,
 } =
 await context.params;


 return apiSuccess(
  await deleteAdminNotificationTemplate(
   user,
   templateId,
  )
 );


 }
 )(request);


}
