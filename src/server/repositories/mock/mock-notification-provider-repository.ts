import type {
 NotificationProviderRepository,
 NotificationProviderRecord,
 CreateNotificationProviderInput,
 UpdateNotificationProviderInput,
} from "../contracts/notification-provider-repository";



const providers:
NotificationProviderRecord[] = [];




export class MockNotificationProviderRepository
implements NotificationProviderRepository {



async list()
:Promise<NotificationProviderRecord[]>{

 return providers;

}





async findById(
 id:string,
)
:Promise<NotificationProviderRecord|null>{

 return (
  providers.find(
   item =>
    item.id===id
  )
  ??
  null
 );

}





async create(
 input:CreateNotificationProviderInput,
)
:Promise<NotificationProviderRecord>{


 const now =
 new Date();



 const item:NotificationProviderRecord={

  id:
   crypto.randomUUID(),

  name:
   input.name,

  channel:
   input.channel,

  provider:
   input.provider,

  enabled:
   input.enabled ?? true,

  isDefault:
   input.isDefault ?? false,

  priority:
   input.priority ?? 0,

  config:
   input.config ?? {},

  createdAt:
   now,

  updatedAt:
   now,

 };



 providers.push(item);



 return item;

}





async update(
 id:string,
 input:UpdateNotificationProviderInput,
)
:Promise<NotificationProviderRecord>{



 const item =
 providers.find(
  x =>
   x.id===id
 );



 if(!item){

  throw new Error(
   "Notification provider not found"
  );

 }



 Object.assign(
  item,
  input,
  {
   updatedAt:new Date()
  }
 );



 return item;

}





async delete(
 id:string,
)
:Promise<void>{



 const index =
 providers.findIndex(
  x =>
   x.id===id
 );



 if(index>=0){

  providers.splice(
   index,
   1
  );

 }


}



}
