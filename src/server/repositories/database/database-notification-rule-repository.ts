import type {
  NotificationRule,
} from "@/generated/prisma/client";


import {
  getPrismaClient,
} from "@/server/db/prisma";


import type {
  NotificationRuleRepository,
} from "@/server/repositories/contracts/notification-rule-repository";



export class DatabaseNotificationRuleRepository
implements NotificationRuleRepository {


private prisma =
 getPrismaClient();



async list():Promise<NotificationRule[]>{

 return this.prisma.notificationRule.findMany({

  orderBy:{
   createdAt:"desc",
  },

 });

}



async findById(
 id:string,
){

 return this.prisma.notificationRule.findUnique({

  where:{
   id,
  },

 });

}



async create(input:{

 name:string;

 eventKey:string;

 channel:string;

 enabled?:boolean;

 delayDays?:number;

 conditions?:unknown;

}){


 return this.prisma.notificationRule.create({

  data:{

   name:input.name,

   eventKey:input.eventKey,

   channel:input.channel,

   enabled:
    input.enabled ?? true,

   delayDays:
    input.delayDays ?? 0,

   conditions:
    input.conditions ?? {},

  },

 });


}



async update(
 id:string,
 input:Partial<{

  name:string;

  channel:string;

  enabled:boolean;

  delayDays:number;

  conditions:object;

 }>,
){


 return this.prisma.notificationRule.update({

  where:{
   id,
  },

  data:{
   ...input,
   conditions:
    input.conditions,
  },

 });


}



async delete(
 id:string,
):Promise<void>{

 await this.prisma.notificationRule.delete({

  where:{
   id,
  },

 });

}


}
