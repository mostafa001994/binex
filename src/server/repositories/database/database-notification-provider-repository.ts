import {
  getPrismaClient,
} from "@/server/db/prisma";

import type {
  NotificationProviderRepository,
  CreateNotificationProviderInput,
  UpdateNotificationProviderInput,
} from "../contracts/notification-provider-repository";


export class DatabaseNotificationProviderRepository
implements NotificationProviderRepository {


  async list(){

    return getPrismaClient()
      .notificationProvider
      .findMany({
        orderBy:[
          {
            priority:"asc",
          },
          {
            createdAt:"desc",
          },
        ],
      });

  }


async findById(
 id:string,
){

 return getPrismaClient()
 .notificationProvider
 .findUnique({

  where:{
   id,
  },

 });

}


  async create(
    input:CreateNotificationProviderInput,
  ){

    return getPrismaClient()
      .notificationProvider
      .create({
        data:{
          name:input.name,
          channel:input.channel,
          provider:input.provider,
          enabled:input.enabled ?? true,
          isDefault:input.isDefault ?? false,
          priority:input.priority ?? 0,
          config:(input.config ?? {}) as object,
        },
      });

  }



  async update(
    id:string,
    input:UpdateNotificationProviderInput,
  ){

    return getPrismaClient()
      .notificationProvider
      .update({
        where:{
          id,
        },
        data:{
          name:input.name,
          enabled:input.enabled,
          isDefault:input.isDefault,
          priority:input.priority,
          config:input.config as object,
        },
      });

  }



  async delete(
    id:string,
  ){

    await getPrismaClient()
      .notificationProvider
      .delete({
        where:{
          id,
        },
      });

  }

}
