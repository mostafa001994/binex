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
 getAdminNotificationRules,
 createAdminNotificationRule,
} from "@/server/admin/admin-notification-rule-service";



export const dynamic="force-dynamic";



export async function GET(
 request:NextRequest,
){

return withApiHandler(async(req)=>{


const user =
 await getAuthenticatedUser(
  req.cookies.get(AUTH_COOKIE_NAME)?.value
 );


const rules =
 await getAdminNotificationRules(user);



return apiSuccess({
 rules,
});


})(request);

}




export async function POST(
 request:NextRequest,
){

return withApiHandler(async(req)=>{


const user =
 await getAuthenticatedUser(
  req.cookies.get(AUTH_COOKIE_NAME)?.value
 );


const body =
 await req.json();



const rule =
 await createAdminNotificationRule(
  user,
  body,
 );



return apiSuccess({
 rule,
});


})(request);

}
