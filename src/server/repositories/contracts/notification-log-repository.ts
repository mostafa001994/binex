export type NotificationLogRecord = {

 id:string;

 eventKey:string;

 channel:string;

 receiver:string;

 message:string;

 status:string;

 providerId:string|null;

 referenceId:string|null;

 referenceType:string|null;

 createdAt:Date;

};



export type CreateNotificationLogInput = {

 eventKey:string;

 channel:string;

 receiver:string;

 message:string;

 status:string;

 providerId?:string|null;

 referenceId?:string|null;

 referenceType?:string|null;

};



export interface NotificationLogRepository {


 create(
  input:CreateNotificationLogInput,
 ):Promise<NotificationLogRecord>;



 list():Promise<NotificationLogRecord[]>;


 exists(
  input:{
   eventKey:string;
   channel:string;
   receiver:string;
   referenceId?:string;
   status:string;
  }
 ):Promise<boolean>;


}
