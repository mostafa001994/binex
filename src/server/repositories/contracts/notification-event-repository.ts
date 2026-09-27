export type NotificationEventRecord = {

 id:string;

 key:string;

 name:string;

 module:string;

 enabled:boolean;

 createdAt:Date;

 updatedAt:Date;

};



export type CreateNotificationEventInput = {

 key:string;

 name:string;

 module:string;

 enabled?:boolean;

};



export type UpdateNotificationEventInput = {

 name?:string;

 module?:string;

 enabled?:boolean;

};



export interface NotificationEventRepository {


 list():
 Promise<NotificationEventRecord[]>;


 create(
  input:CreateNotificationEventInput,
 ):
 Promise<NotificationEventRecord>;



 update(
  id:string,
  input:UpdateNotificationEventInput,
 ):
 Promise<NotificationEventRecord>;



 delete(
  id:string,
 ):
 Promise<void>;

}
