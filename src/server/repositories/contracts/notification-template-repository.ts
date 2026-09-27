export type NotificationTemplateRecord = {

  id:string;

  eventKey:string;

  channel:string;

  title:string | null;

  body:string;

  variables:unknown;

  enabled:boolean;

  createdAt:Date;

  updatedAt:Date;

};



export type CreateNotificationTemplateInput = {

  eventKey:string;

  channel:string;

  title?:string | null;

  body:string;

  variables?:unknown;

  enabled?:boolean;

};



export type UpdateNotificationTemplateInput = {

  title?:string | null;

  body?:string;

  variables?:unknown;

  enabled?:boolean;

};



export interface NotificationTemplateRepository {


  list():Promise<NotificationTemplateRecord[]>;


  create(
    input:CreateNotificationTemplateInput,
  ):Promise<NotificationTemplateRecord>;



  update(
    id:string,
    input:UpdateNotificationTemplateInput,
  ):Promise<NotificationTemplateRecord>;



  delete(
    id:string,
  ):Promise<void>;



  findByEvent(
    eventKey:string,
    channel:string,
  ):Promise<NotificationTemplateRecord | null>;


}
