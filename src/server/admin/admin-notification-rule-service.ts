import type { AuthUser } from "@/server/auth/auth-types";


import {
 requireAdminPermission,
} from "@/server/admin/admin-service";


import {
 getNotificationRuleRepository,
} from "@/server/repositories/repository-provider";



export async function getAdminNotificationRules(
 user:AuthUser,
){

 requireAdminPermission(
  user,
  "admin.notifications.read",
 );


 return getNotificationRuleRepository()
 .list();

}



export async function createAdminNotificationRule(
 user:AuthUser,
 input:{
  name:string;
  eventKey:string;
  channel:string;
  enabled?:boolean;
  delayDays?:number;
  conditions?:unknown;
 },
){


 requireAdminPermission(
  user,
  "admin.notifications.manage",
 );


 return getNotificationRuleRepository()
 .create(input);

}



export async function updateAdminNotificationRule(
 user:AuthUser,
 id:string,
 input:Partial<{
  name:string;
  channel:string;
  enabled:boolean;
  delayDays:number;
  conditions:unknown;
 }>,
){


 requireAdminPermission(
  user,
  "admin.notifications.manage",
 );


 return getNotificationRuleRepository()
 .update(
  id,
  input,
 );

}



export async function deleteAdminNotificationRule(
 user:AuthUser,
 id:string,
){


 requireAdminPermission(
  user,
  "admin.notifications.manage",
 );


 await getNotificationRuleRepository()
 .delete(id);


 return {
  deleted:true,
 };

}
