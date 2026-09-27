import { PrismaClient } from "@/generated/prisma/client";


export async function seedNotificationRules(
 prisma: PrismaClient,
){

 const rules = [

  {
   name:
    "Subscription Expiring SMS",

   eventKey:
    "subscription.expiring",

   channel:
    "sms",

   enabled:
    true,

   delayDays:
    0,

   conditions:
    {},
  },


 ];


 for(const rule of rules){

  await prisma.notificationRule.upsert({

   where:{
    id:
     (
      await prisma.notificationRule.findFirst({
       where:{
        eventKey:rule.eventKey,
        channel:rule.channel,
       }
      })
     )?.id ?? "00000000-0000-0000-0000-000000000000"
   },


   update:{

    name:
     rule.name,

    enabled:
     rule.enabled,

    delayDays:
     rule.delayDays,

    conditions:
     rule.conditions,

   },


   create:rule,

  });

 }


 console.log(
  "notification rules seed connected"
 );

}
