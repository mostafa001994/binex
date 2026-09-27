import {
 getPrismaClient,
} from "@/server/db/prisma";


import type {
 NotificationEventRepository,
 CreateNotificationEventInput,
 UpdateNotificationEventInput,
} from "@/server/repositories/contracts/notification-event-repository";



export class DatabaseNotificationEventRepository
implements NotificationEventRepository{


 async list(){

  return getPrismaClient()
   .notificationEvent
   .findMany({
    orderBy:{
     createdAt:"desc",
    },
   });

 }



 async create(
  input:CreateNotificationEventInput
 ){

  return getPrismaClient()
   .notificationEvent
   .create({
    data:{
     key:input.key,
     name:input.name,
     module:input.module,
     enabled:input.enabled ?? true,
    },
   });

 }



 async update(
  id:string,
  input:UpdateNotificationEventInput,
 ){

  return getPrismaClient()
   .notificationEvent
   .update({
    where:{
     id,
    },
    data:input,
   });

 }



 async delete(
  id:string,
 ){

  await getPrismaClient()
   .notificationEvent
   .delete({
    where:{
     id,
    },
   });

 }

}
