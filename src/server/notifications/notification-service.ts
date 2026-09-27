import type {
  SendNotificationInput,
  SendNotificationResult,
} from "./notification-types";


export async function sendNotification(
  input:SendNotificationInput,
):Promise<SendNotificationResult>{


  /*
    فعلاً Mock است.
    Provider واقعی در مرحله بعد وصل می‌شود.
  */


  console.log(
    "NOTIFICATION",
    input,
  );


  return {

    success:true,

    providerId:
      "mock-notification",

  };

}
