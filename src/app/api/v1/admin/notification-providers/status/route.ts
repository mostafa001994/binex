import {
 NextRequest,
 NextResponse,
} from "next/server";


import {
 getNotificationProviderRepository,
} from "@/server/repositories/repository-provider";


import {
 getNotificationProviderAdapter,
} from "@/server/notifications/providers/provider-factory";


import {
 getAuthenticatedUser,
 AUTH_COOKIE_NAME,
} from "@/server/auth/auth-service";



export const dynamic =
"force-dynamic";



export async function GET(
 request:NextRequest
){


 await getAuthenticatedUser(
  request.cookies.get(
   AUTH_COOKIE_NAME
  )?.value
 );



 const id =
  request.nextUrl.searchParams.get(
   "id"
  );



 if(!id){

  return NextResponse.json(
   {
    error:"Provider id required"
   },
   {
    status:400
   }
  );

 }



 const repository =
  getNotificationProviderRepository();



 const provider =
  await repository.findById(
   id
  );



 if(!provider){

  return NextResponse.json(
   {
    error:"Provider not found"
   },
   {
    status:404
   }
  );

 }



 const adapter =
  getNotificationProviderAdapter(
   provider.provider
  );



 if(!adapter.getStatus){

  return NextResponse.json({

   connected:false,

   message:
    "این Provider وضعیت ندارد"

  });

 }



const config =
 typeof provider.config === "string"
  ? JSON.parse(provider.config)
  : provider.config;


const status =
 await adapter.getStatus(
  config
 );


 console.log(
  "PROVIDER STATUS RESULT:",
  status
 );


return NextResponse.json(
 {
  success:true,
  data:status,
 }
);


}
