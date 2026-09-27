import type { NextRequest } from "next/server";

import {
 apiSuccess,
} from "@/server/core/api-response";

import {
 withApiHandler,
} from "@/server/core/route-handler";


import {
 getAuthenticatedUser,
 AUTH_COOKIE_NAME,
} from "@/server/auth/auth-service";


import {
 getNotificationLogRepository,
} from "@/server/repositories/repository-provider";



export const dynamic="force-dynamic";



export async function GET(
 request:NextRequest,
){

return withApiHandler(async(req)=>{


const user =
 await getAuthenticatedUser(
  req.cookies.get(AUTH_COOKIE_NAME)?.value
 );


const logs =
 await getNotificationLogRepository()
 .list();



return apiSuccess({

 logs,

});


})(request);


}
