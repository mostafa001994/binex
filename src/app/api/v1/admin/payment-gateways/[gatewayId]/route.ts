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
 updateAdminPaymentGateway,
 deleteAdminPaymentGateway,
} from "@/server/admin/admin-payment-gateway-service";


export const dynamic="force-dynamic";



export async function PATCH(
 request:NextRequest,
 context:{
  params:Promise<{
   gatewayId:string
  }>
 }
){

return withApiHandler(
async(req:NextRequest)=>{

const user =
await getAuthenticatedUser(
 req.cookies.get(
  AUTH_COOKIE_NAME
 )?.value
);


const {
 gatewayId
}=await context.params;


const body =
await req.json()
.catch(()=>({}));


return apiSuccess({
 gateway:
 await updateAdminPaymentGateway(
  user,
  gatewayId,
  body
 ),
});


}
)(request);

}



export async function DELETE(
 request:NextRequest,
 context:{
  params:Promise<{
   gatewayId:string
  }>
 }
){

return withApiHandler(
async(req:NextRequest)=>{

const user =
await getAuthenticatedUser(
 req.cookies.get(
  AUTH_COOKIE_NAME
 )?.value
);


const {
 gatewayId
}=await context.params;


return apiSuccess(
 await deleteAdminPaymentGateway(
  user,
  gatewayId
 )
);


}
)(request);

}
