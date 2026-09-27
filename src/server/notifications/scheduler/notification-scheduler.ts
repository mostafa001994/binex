import {
 getPrismaClient,
} from "@/server/db/prisma";


import {
 sendNotification,
} from "@/server/notifications/notification-engine";


import {
 handleSubscriptionExpiring,
} from "@/server/notifications/handlers/subscription-handler";



export async function runNotificationScheduler(){


 const prisma =
  getPrismaClient();



 const rules =
 await prisma.notificationRule.findMany({

  where:{
   enabled:true,
  },

 });



 for(const rule of rules){


  /*
    در اینجا بعداً هر Event
    Handler خودش را خواهد داشت

    مثال:

    subscription.expiring

    payment.reminder

    ticket.reply

  */



  console.log(
   "processing notification rule:",
   rule.eventKey,
  );


  switch(rule.eventKey){


   case "subscription.expiring":

    await handleSubscriptionExpiring(
     rule.delayDays,
    );

    break;


  }



 }


 return {

  processed:
   rules.length,

 };


}
