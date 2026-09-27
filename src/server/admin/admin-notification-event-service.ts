import {
 NOTIFICATION_EVENTS,
} from "@/server/notifications/event-catalog";


import type {
  AuthUser,
} from "@/server/auth/auth-types";


import {
  requireAdminPermission,
} from "@/server/admin/admin-service";


import {
  getNotificationEventRepository,
} from "@/server/repositories/repository-provider";


import type {
  CreateNotificationEventInput,
  UpdateNotificationEventInput,
} from "@/server/repositories/contracts/notification-event-repository";



export async function listAdminNotificationEvents(
  user: AuthUser,
){

  requireAdminPermission(
    user,
    "admin.notifications.manage",
  );


  const events =
    await getNotificationEventRepository()
    .list();


  return events.map(event=>{

    const definition =
      NOTIFICATION_EVENTS.find(
        item =>
          item.key === event.key
      );


    return {

      ...event,

      description:
        definition?.description ?? "",


      variables:
        definition?.variables ?? [],

    };

  });

}




export async function createAdminNotificationEvent(
  user: AuthUser,
  input: CreateNotificationEventInput,
){

  requireAdminPermission(
    user,
    "admin.notifications.manage",
  );


  return getNotificationEventRepository()
    .create(input);

}





export async function updateAdminNotificationEvent(
  user: AuthUser,
  id:string,
  input: UpdateNotificationEventInput,
){

  requireAdminPermission(
    user,
    "admin.notifications.manage",
  );


  return getNotificationEventRepository()
    .update(
      id,
      input,
    );

}





export async function deleteAdminNotificationEvent(
  user: AuthUser,
  id:string,
){

  requireAdminPermission(
    user,
    "admin.notifications.manage",
  );


  await getNotificationEventRepository()
    .delete(id);


  return {
    deleted:true,
  };

}
