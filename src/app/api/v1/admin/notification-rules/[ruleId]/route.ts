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
 updateAdminNotificationRule,
 deleteAdminNotificationRule,
} from "@/server/admin/admin-notification-rule-service";



export const dynamic="force-dynamic";



export async function PATCH(
 request:NextRequest,
 context:{
  params:Promise<{
   ruleId:string;
  }>
 },
){


return withApiHandler(async(req)=>{


const user =
 await getAuthenticatedUser(
  req.cookies.get(AUTH_COOKIE_NAME)?.value
 );


const {
 ruleId,
} =
 await context.params;



const body =
 await req.json();



const rule =
 await updateAdminNotificationRule(
  user,
  ruleId,
  body,
 );



return apiSuccess({
 rule,
});


})(request);

}




export async function DELETE(
 request:NextRequest,
 context:{
  params:Promise<{
   ruleId:string;
  }>
 },
){


return withApiHandler(async(req)=>{


const user =
 await getAuthenticatedUser(
  req.cookies.get(AUTH_COOKIE_NAME)?.value
 );


const {
 ruleId,
} =
 await context.params;



const result =
 await deleteAdminNotificationRule(
  user,
  ruleId,
 );



return apiSuccess(
 result,
);


})(request);

}
