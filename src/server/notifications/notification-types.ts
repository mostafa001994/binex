export type NotificationChannel =
  | "sms"
  | "bale"
  | "email"
  | "push";


export type SendNotificationInput = {

  channel: NotificationChannel;

  receiver: string;

  message: string;

  eventKey?: string;

};


export type SendNotificationResult = {

  success:boolean;

  providerId?:string;

  error?:string;

};
