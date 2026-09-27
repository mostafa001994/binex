import {
  getNotificationTemplateRepository,
  getNotificationProviderRepository,
  getNotificationLogRepository,
} from "@/server/repositories/repository-provider";

import {
  getNotificationProviderAdapter,
} from "@/server/notifications/providers/provider-factory";


type SendNotificationInput = {

  eventKey:string;

  channel:string;

  receiver:string;

  referenceId?:string;

  referenceType?:string;

  data:Record<string,unknown>;

};



function replaceVariables(
  text:string,
  data:Record<string,unknown>,
){

  let result = text;


  Object.entries(data)
  .forEach(([key,value])=>{

    result =
      result.replaceAll(
        `{{${key}}}`,
        String(value ?? ""),
      );


    result =
      result.replaceAll(
        `{${key}}`,
        String(value ?? ""),
      );

  });


  return result;

}




export async function sendNotification(
  input:SendNotificationInput,
){


console.log(
 "NOTIFICATION ENGINE CALLED:",
 input.eventKey,
 input.receiver
);



 const templateRepository =
  getNotificationTemplateRepository();



console.log(
 "TEMPLATE SEARCH:",
 input.eventKey,
 input.channel
);



 const template =
  await templateRepository.findByEvent(
    input.eventKey,
    input.channel,
  );



 if(!template){

  throw new Error(
    `Notification template not found: ${input.eventKey}`
  );

 }




 const message =
  replaceVariables(
    template.body,
    input.data,
  );




 const providerRepository =
  getNotificationProviderRepository();



 const providers =
  await providerRepository.list();



console.log(
 "PROVIDERS COUNT:",
 providers.length
);




 const provider =
  providers
  .filter(
    item =>
      item.enabled &&
      item.channel === input.channel,
  )
  .sort(
    (a,b)=>{

      if(
        a.isDefault &&
        !b.isDefault
      ){

        return -1;

      }


      if(
        !a.isDefault &&
        b.isDefault
      ){

        return 1;

      }


      return a.priority - b.priority;

    },
  )[0];





 if(!provider){

  throw new Error(
    `Notification provider not found: ${input.channel}`
  );

 }




console.log(
 "SELECTED PROVIDER:",
 provider.provider,
 provider.id
);




 const alreadySent =
  await getNotificationLogRepository()
  .exists({

    eventKey:
      input.eventKey,

    channel:
      input.channel,

    receiver:
      input.receiver,

    referenceId:
      input.referenceId,

    status:
      "success",

  });





if(
  alreadySent &&
  input.eventKey !== "auth.otp"
){

  console.log(
   "NOTIFICATION SKIPPED ALREADY SENT"
  );


  return {

    success:true,

    skipped:true,

  };

}




 const adapter =
  getNotificationProviderAdapter(
    provider.provider,
  );





console.log(
 "NOTIFICATION SEND START:",
 {
  provider: provider.provider,
  receiver: input.receiver,
  eventKey: input.eventKey,
 }
);


 const sendResult =
  await adapter.send({

    receiver:
      input.receiver,

    message,

    config:
      provider.config,

  });





// console.log(
//  "NOTIFICATION SEND RESULT:",
//  sendResult
// );





 await getNotificationLogRepository()
 .create({

    eventKey:
      input.eventKey,


    channel:
      input.channel,


    receiver:
      input.receiver,


    message,


    status:
      sendResult.success
      ?
      "success"
      :
      "failed",


    providerId:
      provider.id,


    referenceId:
      input.referenceId ?? null,


    referenceType:
      input.referenceType ?? null,

 });






 return {

    success:
      sendResult.success,


    providerId:
      provider.id,


    providerMessageId:
      sendResult.providerMessageId,


    message,


    receiver:
      input.receiver,

 };

}
