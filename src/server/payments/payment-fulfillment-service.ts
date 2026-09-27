import {
  BusinessServiceStatus,
  CustomServiceOfferStatus,
  CustomServiceSubscriptionStatus,
  OrderItemType,
  Prisma,
  ProvisioningAction,
  ProvisioningStatus,
  SubscriptionStatus,
} from "@/generated/prisma/client";

import {
  dispatchProvisioningJob,
} from "@/server/automation/provisioning-dispatcher";

import {
  getPrismaClient,
} from "@/server/db/prisma";
import { createDatabaseAuditLog } from "@/server/repositories/database/database-audit-repository";



function calculatePeriodEnd(
  start:Date,
  billingPeriod:string,
  customDurationDays?:number|null,
){

  const end =
    new Date(start);

  const addMonths = (months:number) => {
    const day = end.getDate();
    end.setDate(1);
    end.setMonth(end.getMonth() + months);
    const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    end.setDate(Math.min(day, lastDay));
  };


  switch(billingPeriod){


    case "MONTHLY":

      addMonths(1);

      break;



    case "QUARTERLY":

      addMonths(3);

      break;



    case "YEARLY":

      addMonths(12);

      break;



    case "CUSTOM":

      if(!customDurationDays){

        throw new Error(
          "customDurationDays is required"
        );

      }


      end.setDate(
        end.getDate() + customDurationDays
      );

      break;



    default:

      throw new Error(
        `Unsupported billing period: ${billingPeriod}`
      );

  }


  return end;

}




export async function fulfillPaidOrder(
  orderId:string,
){

  const prisma = getPrismaClient();

  const result = await prisma.$transaction(
    async(tx)=>{

      const order =
        await tx.order.findUnique({
          where:{
            id:orderId,
          },
          include:{
            items:true,
          },
        });


      if(!order){
        throw new Error("Order not found");
      }


      const createdJobs:string[] = [];


      for(const item of order.items){

        if(item.type === OrderItemType.CUSTOM_SERVICE){

          if(!item.customServiceOfferId){
            throw new Error("Custom service offer is missing from the order item");
          }

          const offer = await tx.customServiceOffer.findUnique({
            where:{ id:item.customServiceOfferId },
            include:{ customService:true, subscription:true },
          });

          if(!offer){
            throw new Error("Custom service offer was not found");
          }

          if(offer.businessId !== order.businessId){
            throw new Error("Custom service offer does not belong to this business");
          }

          if(offer.subscription){
            if(item.customSubscriptionId !== offer.subscription.id){
              await tx.orderItem.update({
                where:{ id:item.id },
                data:{ customSubscriptionId:offer.subscription.id },
              });
            }
            continue;
          }

          const startsAt = new Date();
          const endsAt = calculatePeriodEnd(
            startsAt,
            item.billingPeriodSnapshot,
            item.customDurationDays,
          );
          const subscription = await tx.customServiceSubscription.create({
            data:{
              offerId:offer.id,
              customServiceId:offer.customServiceId,
              businessId:order.businessId,
              orderId:order.id,
              status:CustomServiceSubscriptionStatus.ACTIVE,
              serviceNameSnapshot:item.serviceNameSnapshot,
              offerTitleSnapshot:item.planNameSnapshot,
              descriptionSnapshot:offer.description,
              featuresSnapshot:offer.features as Prisma.InputJsonValue,
              priceAmount:item.unitAmount,
              currency:order.currency,
              billingPeriod:item.billingPeriodSnapshot,
              customDurationDays:item.customDurationDays,
              startsAt,
              endsAt,
            },
          });

          await tx.orderItem.update({
            where:{ id:item.id },
            data:{ customSubscriptionId:subscription.id },
          });
          await tx.customServiceOffer.update({
            where:{ id:offer.id },
            data:{ status:CustomServiceOfferStatus.PAID, paidAt:startsAt },
          });
          await createDatabaseAuditLog(tx, {
            actorUserId:order.createdByUserId ?? offer.createdByUserId,
            action:"custom_service_offer_paid",
            targetType:"custom-service-offer",
            targetId:offer.id,
            metadata:{ orderId:order.id, subscriptionId:subscription.id },
          });
          continue;

        }


        if(item.type !== OrderItemType.NEW_SUBSCRIPTION){
          continue;
        }

        if(!item.serviceId || !item.planId){
          throw new Error("Public service and plan are required for subscription fulfillment");
        }


        // A provider callback can be delivered more than once. Once the
        // order item is linked, fulfillment for that item is complete and
        // must not extend the subscription or create another job again.
        if(item.subscriptionId){
          continue;
        }


        const existingBusinessService =
          await tx.businessService.findUnique({
            where:{
              businessId_serviceId:{
                businessId:order.businessId,
                serviceId:item.serviceId,
              },
            },
          });


        const serviceAlreadyReady =
          existingBusinessService?.status === BusinessServiceStatus.ACTIVE &&
          existingBusinessService.setupCompleted;


        let subscription =
          await tx.subscription.findFirst({

            where:{
              businessId: order.businessId,
              serviceId: item.serviceId,
              status: SubscriptionStatus.ACTIVE,
            },

          });


        const now = new Date();


        const periodStart =
          subscription &&
          subscription.currentPeriodEndsAt &&
          subscription.currentPeriodEndsAt > now
            ? subscription.currentPeriodEndsAt
            : now;


        const newPeriodEnd =
          calculatePeriodEnd(
            periodStart,
            item.billingPeriodSnapshot,
            item.customDurationDays,
          );


        if(subscription){


          await tx.subscription.update({

            where:{
              id:subscription.id,
            },

            data:{
              planId:item.planId,
              planCodeSnapshot:item.planCodeSnapshot,
              planNameSnapshot:item.planNameSnapshot,
              billingPeriod:item.billingPeriodSnapshot,
              customDurationDays:item.customDurationDays,
              priceAmount:item.unitAmount,
              currentPeriodStartsAt:periodStart,
              currentPeriodEndsAt:newPeriodEnd,
            },

          });


        } else {


          subscription =
            await tx.subscription.create({

              data:{

                businessId:order.businessId,

                serviceId:item.serviceId,

                planId:item.planId,

                status:SubscriptionStatus.ACTIVE,

                provisioningStatus:
                  serviceAlreadyReady
                    ? ProvisioningStatus.READY
                    : ProvisioningStatus.QUEUED,

                priceAmount:item.unitAmount,

                currency:order.currency,

                billingPeriod:item.billingPeriodSnapshot,

                customDurationDays:item.customDurationDays,

                planNameSnapshot:item.planNameSnapshot,

                planCodeSnapshot:item.planCodeSnapshot,

                startsAt:now,

                currentPeriodStartsAt:now,

                currentPeriodEndsAt:newPeriodEnd,

              },

            });

        }



        if(!serviceAlreadyReady){
          await tx.businessService.upsert({

          where:{
            businessId_serviceId:{
              businessId:order.businessId,
              serviceId:item.serviceId,
            },
          },

          update:{
            status:BusinessServiceStatus.SETUP,
            setupCompleted:false,
          },

          create:{
            businessId:order.businessId,
            serviceId:item.serviceId,
            status:BusinessServiceStatus.SETUP,
            setupCompleted:false,
          },

          });
        }



        await tx.orderItem.update({

          where:{
            id:item.id,
          },

          data:{
            subscriptionId:subscription.id,
          },

        });


        if(serviceAlreadyReady){
          continue;
        }



        const existingJob =
          await tx.provisioningJob.findFirst({

            where:{

              subscriptionId:subscription.id,

              idempotencyKey:
                `payment:${order.id}:${subscription.id}`,

            },

          });



        if(existingJob){
          continue;
        }



        const job =
          await tx.provisioningJob.create({

            data:{

              subscriptionId:subscription.id,

              businessId:order.businessId,

              serviceId:item.serviceId,

              action:ProvisioningAction.ACTIVATE,

              idempotencyKey:
                `payment:${order.id}:${subscription.id}`,

              payload:{
                source:"payment",
                orderId,
              },

            },

          });



        createdJobs.push(job.id);


      }


      return createdJobs;


    },
  );



  for(const jobId of result){

    await dispatchProvisioningJob(jobId);

  }


}
