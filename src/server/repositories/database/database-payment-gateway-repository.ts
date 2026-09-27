import {
  Prisma,
} from "@/generated/prisma/client";

import {
  getPrismaClient,
} from "@/server/db/prisma";

import type {
  PaymentGatewayRepository,
  CreatePaymentGatewayInput,
  UpdatePaymentGatewayInput,
} from "@/server/repositories/contracts/payment-gateway-repository";


export class DatabasePaymentGatewayRepository
implements PaymentGatewayRepository {


async list(){

 return getPrismaClient()
 .paymentGateway
 .findMany({
  orderBy:[
   {
    priority:"asc",
   },
   {
    createdAt:"desc",
   },
  ],
 });

}



async findById(id:string){

 return getPrismaClient()
 .paymentGateway
 .findUnique({
  where:{
   id,
  },
 });

}



async create(
 input:CreatePaymentGatewayInput,
){

 return getPrismaClient()
 .paymentGateway
 .create({
  data:{
   name:input.name,
   slug:input.slug,
   provider:input.provider,
   enabled:input.enabled ?? false,
   priority:input.priority ?? 0,
   config:
    input.config as Prisma.InputJsonValue ?? {},
  },
 });

}



async update(
 id:string,
 input:UpdatePaymentGatewayInput,
){

 return getPrismaClient()
 .paymentGateway
 .update({
  where:{
   id,
  },
  data:{
   name:input.name,
   enabled:input.enabled,
   priority:input.priority,
   config:
    input.config === undefined
    ? undefined
    : input.config as Prisma.InputJsonValue,
  },
 });

}



async delete(id:string){

 await getPrismaClient()
 .paymentGateway
 .delete({
  where:{
   id,
  },
 });

}


}
