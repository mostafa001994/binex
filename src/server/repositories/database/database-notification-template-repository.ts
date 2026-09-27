import {
 getPrismaClient,
} from "@/server/db/prisma";


import type {
 NotificationTemplateRepository,
 CreateNotificationTemplateInput,
 UpdateNotificationTemplateInput,
} from "../contracts/notification-template-repository";



export class DatabaseNotificationTemplateRepository
implements NotificationTemplateRepository {



async list(){

 return getPrismaClient()
 .notificationTemplate
 .findMany({
  orderBy:{
   createdAt:"desc",
  },
 });

}




async create(
 input:CreateNotificationTemplateInput,
){

 return getPrismaClient()
 .notificationTemplate
 .create({
  data:{
   eventKey:input.eventKey,
   channel:input.channel,
   title:input.title ?? null,
   body:input.body,
   variables:(input.variables ?? {}) as object,
   enabled:input.enabled ?? true,
  },
 });


}




async update(
 id:string,
 input:UpdateNotificationTemplateInput,
){

 return getPrismaClient()
 .notificationTemplate
 .update({

  where:{
   id,
  },

  data:{
   title:input.title,
   body:input.body,
   variables:input.variables as object,
   enabled:input.enabled,
  },

 });

}




async delete(
 id:string,
){

 await getPrismaClient()
 .notificationTemplate
 .delete({
  where:{
   id,
  },
 });

}




async findByEvent(
 eventKey:string,
 channel:string,
){

 return getPrismaClient()
 .notificationTemplate
 .findFirst({
  where:{
   eventKey,
   channel,
   enabled:true,
  },
 });

}


}
