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
 listAdminNotificationTemplates,
 createAdminNotificationTemplate,
} from "@/server/admin/admin-notification-template-service";


export const dynamic="force-dynamic";



export const GET =
withApiHandler(
async(
 request:NextRequest,
)=>{


 const user =
 await getAuthenticatedUser(
  request.cookies.get(AUTH_COOKIE_NAME)?.value
 );


 return apiSuccess({
  templates:
   await listAdminNotificationTemplates(user),
 });


});





export const POST =
withApiHandler(
async(
 request:NextRequest,
)=>{


 const user =
 await getAuthenticatedUser(
  request.cookies.get(AUTH_COOKIE_NAME)?.value
 );


 const body =
 await request.json()
 .catch(()=>({}));


 return apiSuccess({

  template:
   await createAdminNotificationTemplate(
    user,
    body,
   ),

 });


});
