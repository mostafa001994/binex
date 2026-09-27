import type {
  NotificationProviderAdapter,
  NotificationSendInput,
  NotificationSendResult,
  NotificationProviderStatus,
} from "./provider-contract";


type SmsWebserviceConfig = {
  apiKey: string;
  sender: string;
  url?: string;
};


type SmsWebserviceResponse = {
  Success?: boolean;
  ErrorCode?: unknown;
  Error?: unknown;
  Result?: unknown;
};




export class SmsWebserviceAdapter
implements NotificationProviderAdapter {


  async send(
    input: NotificationSendInput,
  ): Promise<NotificationSendResult> {


let config: SmsWebserviceConfig;


if(typeof input.config === "string"){

 config =
  JSON.parse(input.config);

}
else{

 config =
  input.config as SmsWebserviceConfig;

}


    if (!config?.apiKey) {

      return {
        success:false,
        error:"ApiKey تنظیم نشده",
      };

    }



    if (!config?.sender) {

      return {
        success:false,
        error:"Sender تنظیم نشده",
      };

    }



    const url =
      new URL(
        config.url ??
        "https://api.sms-webservice.com/api/V3/Send"
      );



    url.searchParams.set(
      "ApiKey",
      config.apiKey,
    );


    url.searchParams.set(
      "Text",
      input.message,
    );


    url.searchParams.set(
      "Sender",
      config.sender,
    );


    url.searchParams.set(
      "Recipients",
      input.receiver,
    );




    try {


      const response =
        await fetch(
          url.toString(),
          {
            method:"GET",
          },
        );



      const text =
        await response.text();


console.log(
  "SMS REQUEST:",
  {
    sender: config.sender,
    receiver:
      input.receiver.replace(
        /^(\d{4})\d+(\d{2})$/,
        "$1******$2",
      ),
  },
);



      if (!response.ok) {

        return {

          success:false,

          error:text,

        };

      }



      let parsed:
        SmsWebserviceResponse | null = null;



      try {

        parsed =
          JSON.parse(text);

      } catch {

        parsed = null;

      }



      if (
        parsed &&
        parsed.Success === false
      ) {

        return {

          success:false,

          error:
            String(
              parsed.Error ??
              "خطای سامانه پیامک"
            ),

        };

      }



      return {

        success:true,

        providerMessageId:
          text,

      };



    } catch(error) {


      return {

        success:false,

        error:
          error instanceof Error
          ?
          error.message
          :
          "خطای ناشناخته",

      };


    }


  }





  async getStatus(
    configInput: unknown,
  ): Promise<NotificationProviderStatus> {


    const config =
      configInput as SmsWebserviceConfig;



    if (!config?.apiKey) {

      return {

        connected:false,

        message:
          "ApiKey تنظیم نشده",

      };

    }



    try {


      return {

        connected:true,

        message:
          "Provider آماده است",

      };


    } catch(error) {


      return {

        connected:false,

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
