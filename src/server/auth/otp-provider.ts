import {
  getOtpDriver,
} from "@/server/auth/auth-config";

import {
  sendNotification,
} from "@/server/notifications/notification-engine";


export interface OtpProvider {

  sendCode(
    input:{
      phone:string;
      code:string;
    }
  ):Promise<void>;

}



class MockOtpProvider
implements OtpProvider {


  async sendCode(
    input:{
      phone:string;
      code:string;
    }
  ):Promise<void>{

    void input;

  }


}



class NotificationOtpProvider
implements OtpProvider {


  async sendCode(
    input:{
      phone:string;
      code:string;
    }
  ):Promise<void>{


    const result =
      await sendNotification({

        eventKey:
          "auth.otp",


        channel:
          "sms",


        receiver:
          input.phone,


        data:{

          otp:
            input.code,


          expire_minutes:
            "2",


          user_name:
            "",


          phone:
            input.phone,


          app_name:
            "BINIX",

        },

      });


    if(!result.success){

      throw new Error(
        "OTP notification delivery failed"
      );

    }


  }


}



export function getOtpProvider():OtpProvider {


  if(getOtpDriver()==="mock"){

    return new MockOtpProvider();

  }


  return new NotificationOtpProvider();


}
