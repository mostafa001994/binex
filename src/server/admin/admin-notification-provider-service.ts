import type {
  AuthUser,
} from "@/server/auth/auth-types";

import {
  requireAdminPermission,
} from "@/server/admin/admin-service";

import {
  getNotificationProviderRepository,
} from "@/server/repositories/repository-provider";

import type {
  CreateNotificationProviderInput,
  UpdateNotificationProviderInput,
} from "@/server/repositories/contracts/notification-provider-repository";



export async function listAdminNotificationProviders(
  user: AuthUser,
){

  requireAdminPermission(
    user,
    "admin.notifications.manage",
  );


  return getNotificationProviderRepository()
    .list();

}



export async function createAdminNotificationProvider(
  user: AuthUser,
  input: CreateNotificationProviderInput,
){

  requireAdminPermission(
    user,
    "admin.notifications.manage",
  );


  return getNotificationProviderRepository()
    .create(input);

}



export async function updateAdminNotificationProvider(
  user: AuthUser,
  id:string,
  input:UpdateNotificationProviderInput,
){

  requireAdminPermission(
    user,
    "admin.notifications.manage",
  );


  return getNotificationProviderRepository()
    .update(
      id,
      input,
    );

}



export async function deleteAdminNotificationProvider(
  user:AuthUser,
  id:string,
){

  requireAdminPermission(
    user,
    "admin.notifications.manage",
  );


  await getNotificationProviderRepository()
    .delete(id);


  return {
    deleted:true,
  };

}
