import type {
  NotificationProviderAdapter,
  NotificationSendInput,
  NotificationSendResult,
} from "./provider-contract";



type HttpProviderConfig = {

  url:string;

  method?:string;

  headers?:Record<string,string>;

  body?:Record<string,unknown>;

};





function replaceTemplate(
 value:string,
 input:NotificationSendInput,
){

 return value
  .replaceAll(
   "{{receiver}}",
   input.receiver,
  )
  .replaceAll(
   "{{message}}",
   input.message,
  );

}





function mapObject(
 obj:Record<string,unknown>,
 input:NotificationSendInput,
){

 const result:Record<string,unknown>={};


 Object.entries(obj)
 .forEach(
  ([key,value])=>{

   if(typeof value==="string"){

    result[key]=replaceTemplate(
     value,
     input,
    );

   }
   else{

    result[key]=value;

   }

  }
 );


 return result;

}





export class HttpProviderAdapter
implements NotificationProviderAdapter {




 async send(
  input:NotificationSendInput,
 ):Promise<NotificationSendResult>{


  const config =
   input.config as HttpProviderConfig;



  if(!config?.url){

   return {

    success:false,

    error:"Provider URL is missing",

   };

  }



  const method =
   config.method ?? "POST";



  const body =
   config.body
    ?
    mapObject(
     config.body,
     input,
    )
    :
    undefined;



  const response =
   await fetch(
    config.url,
    {

     method,


     headers:{

      "Content-Type":
       "application/json",


      ...(config.headers ?? {}),

     },


     body:
      method==="GET"
       ?
       undefined
       :
       JSON.stringify(
        body ??
        {
         message:
          input.message,

         receiver:
          input.receiver,
        }
       ),

    },
   );





  if(!response.ok){

   return {

    success:false,

    error:
     await response.text(),

   };

  }




  const text =
   await response.text();




  return {

   success:true,


   providerMessageId:
    text || undefined,

  };


 }








 async getStatus(
  configInput:unknown,
 ){

  const config =
   configInput as HttpProviderConfig;



  if(!config?.url){

   return {

    connected:false,

    message:
     "Provider URL تنظیم نشده",

   };

  }




  try{


   const response =
    await fetch(
     config.url,
     {

      method:
       config.method ?? "GET",


      headers:
       config.headers ?? {},


     },
    );




   const text =
    await response.text();






return {

 connected:
  response.ok,


 statusCode:
  response.status,


 balance:
  undefined,


 senders:
  [],


 message:
  response.ok
   ?
   "اتصال موفق بود"
   :
   "خطا در اتصال",


 response:
  text.slice(0,300),

};




  }catch(error){





return {

 connected:false,


 balance:undefined,


 senders:[],


    message:
     error instanceof Error
      ?
      error.message
      :
      "خطای ناشناخته",

   };


  }


 }





}
