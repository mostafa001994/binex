import type { NextRequest } from "next/server";

import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

import {
 AUTH_COOKIE_NAME,
 getAuthenticatedUser,
} from "@/server/auth/auth-service";

import {
 setDefaultAdminPaymentGateway,
} from "@/server/admin/admin-payment-gateway-service";


export const dynamic="force-dynamic";


export async function POST(
 request:NextRequest,
 context:{
  params:Promise<{gatewayId:string}>
 }
){

 return withApiHandler(async(req)=>{

  const user =
   await getAuthenticatedUser(
    req.cookies.get(AUTH_COOKIE_NAME)?.value
   );


  const {gatewayId} =
   await context.params;


  return apiSuccess({
   gateway:
    await setDefaultAdminPaymentGateway(
     user,
     gatewayId
    )
  });


 })(request);

}
