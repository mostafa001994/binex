import type {
  AuthUser,
} from "@/server/auth/auth-types";

import {
  requireAdminPermission,
} from "@/server/admin/admin-service";

import {
  getNotificationTemplateRepository,
} from "@/server/repositories/repository-provider";


import type {
  CreateNotificationTemplateInput,
  UpdateNotificationTemplateInput,
} from "@/server/repositories/contracts/notification-template-repository";



export async function listAdminNotificationTemplates(
 user:AuthUser,
){

 requireAdminPermission(
  user,
  "admin.notifications.manage",
 );


 return getNotificationTemplateRepository()
 .list();

}





export async function createAdminNotificationTemplate(
 user:AuthUser,
 input:CreateNotificationTemplateInput,
){

 requireAdminPermission(
  user,
  "admin.notifications.manage",
 );


 return getNotificationTemplateRepository()
 .create(input);

}





export async function updateAdminNotificationTemplate(
 user:AuthUser,
 id:string,
 input:UpdateNotificationTemplateInput,
){

 requireAdminPermission(
  user,
  "admin.notifications.manage",
 );


 return getNotificationTemplateRepository()
 .update(
  id,
  input,
 );

}





export async function deleteAdminNotificationTemplate(
 user:AuthUser,
 id:string,
){

 requireAdminPermission(
  user,
  "admin.notifications.manage",
 );


 await getNotificationTemplateRepository()
 .delete(id);


 return {
  deleted:true,
 };

}
