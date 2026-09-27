import type {
  AuthUser,
} from "@/server/auth/auth-types";

import {
  requireAdminPermission,
} from "@/server/admin/admin-service";

import {
  getPrismaClient,
} from "@/server/db/prisma";

import type {
  CreatePaymentGatewayInput,
  UpdatePaymentGatewayInput,
} from "@/server/repositories/contracts/payment-gateway-repository";



export async function listAdminPaymentGateways(
  user: AuthUser,
) {

  requireAdminPermission(
    user,
    "admin.payment-gateways.manage",
  );


  return getPrismaClient()
    .paymentGateway
    .findMany({
      orderBy: [
        {
          priority: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

}



export async function createAdminPaymentGateway(
  user: AuthUser,
  input: CreatePaymentGatewayInput,
) {

  requireAdminPermission(
    user,
    "admin.payment-gateways.manage",
  );


  return getPrismaClient()
    .paymentGateway
    .create({
      data: {
        name: input.name,
        slug: input.slug,
        provider: input.provider,
        enabled: input.enabled ?? true,
        priority: input.priority ?? 0,
        config: (input.config ?? {}) as object,
      },
    });

}



export async function updateAdminPaymentGateway(
  user: AuthUser,
  id: string,
  input: UpdatePaymentGatewayInput,
) {

  requireAdminPermission(
    user,
    "admin.payment-gateways.manage",
  );


  return getPrismaClient()
    .paymentGateway
    .update({
      where: {
        id,
      },
      data: {
        name: input.name,
        enabled: input.enabled,
        priority: input.priority,
        config: (input.config ?? {}) as object,
      },
    });

}



export async function deleteAdminPaymentGateway(
  user: AuthUser,
  id: string,
) {

  requireAdminPermission(
    user,
    "admin.payment-gateways.manage",
  );


  await getPrismaClient()
    .paymentGateway
    .delete({
      where: {
        id,
      },
    });


  return {
    deleted: true,
  };

}


export async function setDefaultAdminPaymentGateway(
  user: AuthUser,
  id: string,
) {

  requireAdminPermission(
    user,
    "admin.payment-gateways.manage",
  );


  const prisma = getPrismaClient();


  await prisma.paymentGateway.updateMany({
    data:{
      isDefault:false,
    },
  });


  return prisma.paymentGateway.update({
    where:{
      id,
    },
    data:{
      isDefault:true,
    },
  });

}



export async function testAdminPaymentGateway(
  user: AuthUser,
  id:string,
){

  requireAdminPermission(
    user,
    "admin.payment-gateways.manage",
  );


  const gateway =
    await getPrismaClient()
    .paymentGateway
    .findUnique({
      where:{
        id,
      },
    });


  if(!gateway){

    throw new Error(
      "درگاه پیدا نشد"
    );

  }


  const config =
    gateway.config as Record<string,unknown>;


  const ready =
    Boolean(
      gateway.enabled &&
      config &&
      Object.keys(config).length
    );


  return {
    success:ready,
    message:
      ready
      ?
      "تنظیمات درگاه معتبر است"
      :
      "تنظیمات درگاه کامل نیست",
  };

}
