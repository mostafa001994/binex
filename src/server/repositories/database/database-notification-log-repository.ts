import {
 getPrismaClient,
} from "@/server/db/prisma";


import type {
 NotificationLogRepository,
 CreateNotificationLogInput,
} from "../contracts/notification-log-repository";



export class DatabaseNotificationLogRepository
implements NotificationLogRepository {



async create(
 input:CreateNotificationLogInput,
){

 return getPrismaClient()
 .notificationLog
 .create({

data:{

   eventKey:
    input.eventKey,

   channel:
    input.channel,

   receiver:
    input.receiver,

   message:
    input.message,

   status:
    input.status,

   providerId:
    input.providerId ?? null,

   referenceId:
    input.referenceId ?? null,

   referenceType:
    input.referenceType ?? null,

},

 });

}




async list(){

 return getPrismaClient()
 .notificationLog
 .findMany({

  orderBy:{
   createdAt:"desc",
  },

  take:200,

 });

}



async exists(
 input:{
  eventKey:string;
  channel:string;
  receiver:string;
  referenceId?:string;
  status:string;
 }
){

 const item =
  await getPrismaClient()
  .notificationLog
  .findFirst({

   where:{

    eventKey:
     input.eventKey,

    channel:
     input.channel,

    receiver:
     input.receiver,

    referenceId:
     input.referenceId ?? undefined,

    status:
     input.status,

   },

  });


 return Boolean(item);

}



}
