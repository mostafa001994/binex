import type { NotificationRule } from "@/generated/prisma/client";


export interface NotificationRuleRepository {


  list(): Promise<NotificationRule[]>;


  findById(
    id:string,
  ): Promise<NotificationRule | null>;



  create(
    input:{
      name:string;
      eventKey:string;
      channel:string;
      enabled?:boolean;
      delayDays?:number;
      conditions?:unknown;
    },
  ): Promise<NotificationRule>;



  update(
    id:string,
    input:Partial<{
      name:string;
      channel:string;
      enabled:boolean;
      delayDays:number;
      conditions:unknown;
    }>,
  ): Promise<NotificationRule>;



  delete(
    id:string,
  ): Promise<void>;

}
