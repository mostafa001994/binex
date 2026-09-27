import type {
 NotificationProviderAdapter,
} from "./provider-contract";


import {
 SmsWebserviceAdapter,
} from "./sms-webservice-adapter";



import {
 HttpProviderAdapter,
} from "./http-provider-adapter";



class SmsIrAdapter
implements NotificationProviderAdapter {


 async send(){

  return {

   success:true,

   providerMessageId:
    "mock-sms-ir",

  };

 }


}



class KavenegarAdapter
implements NotificationProviderAdapter {


 async send(){

  return {

   success:true,

   providerMessageId:
    "mock-kavenegar",

  };

 }


}




class BaleAdapter
implements NotificationProviderAdapter {


 async send(){

  return {

   success:true,

   providerMessageId:
    "mock-bale",

  };

 }


}




export function getNotificationProviderAdapter(
 provider:string,
):NotificationProviderAdapter{


 switch(
  provider.toLowerCase()
 ){


  case "smsir":

   return new SmsIrAdapter();



  case "kavenegar":

   return new KavenegarAdapter();



  case "bale":

   return new BaleAdapter();



  case "http":

  case "generic-http":

   return new HttpProviderAdapter();



case "sms-webservice":

 return new SmsWebserviceAdapter();



  default:

   throw new Error(
    `Unsupported notification provider: ${provider}`
   );

 }


}
