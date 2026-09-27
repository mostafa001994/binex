import type {
 NotificationTemplateRepository,
 NotificationTemplateRecord,
 CreateNotificationTemplateInput,
 UpdateNotificationTemplateInput,
} from "../contracts/notification-template-repository";


export class MockNotificationTemplateRepository
implements NotificationTemplateRepository {


private items:NotificationTemplateRecord[]=[];



async list(){

 return this.items;

}



async create(
 input:CreateNotificationTemplateInput,
){

 const item:NotificationTemplateRecord={

  id:crypto.randomUUID(),

  eventKey:input.eventKey,

  channel:input.channel,

  title:input.title ?? null,

  body:input.body,

  variables:input.variables ?? {},

  enabled:input.enabled ?? true,

  createdAt:new Date(),

  updatedAt:new Date(),

 };


 this.items.push(item);


 return item;

}




async update(
 id:string,
 input:UpdateNotificationTemplateInput,
){

 const item=this.items.find(
  x=>x.id===id
 );


 if(!item)
  throw new Error("Template not found");


 Object.assign(
  item,
  input,
  {
   updatedAt:new Date(),
  },
 );


 return item;

}




async delete(
 id:string,
){

 this.items=this.items.filter(
  x=>x.id!==id
 );

}



async findByEvent(
 eventKey:string,
 channel:string,
){

 return this.items.find(
  x=>
   x.eventKey===eventKey &&
   x.channel===channel &&
   x.enabled
 )
 ?? null;

}


}
