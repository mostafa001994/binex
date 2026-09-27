import {
 getPrismaClient,
} from "@/server/db/prisma";


import {
 sendNotification,
} from "@/server/notifications/notification-engine";



export async function handleSubscriptionExpiring(
 delayDays:number = 2,
){


 const prisma =
  getPrismaClient();



 const targetDate =
  new Date();


 targetDate.setDate(
  targetDate.getDate()+delayDays
 );



 const subscriptions =
 await prisma.subscription.findMany({

  where:{

   currentPeriodEndsAt:{
    lte:targetDate,
    gt:new Date(),
   },


  },


  include:{


   business:{

    include:{

     memberships:{

      include:{
       user:true,
      },

     },

    },

   },


  },


 });



 for(
  const subscription of subscriptions
 ){


  const owner =
   subscription.business.memberships
   .find(
    member =>
    member.role === "OWNER"
   );


  if(!owner?.user.phone){

   continue;

  }



  await sendNotification({

   eventKey:
    "subscription.expiring",


   channel:
    "sms",


   receiver:
    owner.user.phone,


   referenceId:
    subscription.id,


   referenceType:
    "subscription",


   data:{


    business_name:
     subscription.business.name,


    plan_name:
     subscription.planNameSnapshot,


    days_left:
     delayDays,


    expire_date:
     subscription.currentPeriodEndsAt,

   },


  });


 }



 return {

  processed:
   subscriptions.length,

 };


}
