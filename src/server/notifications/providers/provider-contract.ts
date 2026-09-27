export type NotificationSendInput = {

 receiver:string;

 message:string;

 config:unknown;

};



export type NotificationSendResult = {

 success:boolean;

 providerMessageId?:string;

 error?:string;

};




export type NotificationProviderStatus = {

 connected:boolean;

 balance?:number;

 senders?:string[];

 message?:string;

};




export interface NotificationProviderAdapter {


 send(
  input:NotificationSendInput,
 ):Promise<NotificationSendResult>;



 getStatus?(
  config:unknown,
 ):Promise<NotificationProviderStatus>;



}
