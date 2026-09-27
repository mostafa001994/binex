import { BillingPeriod, PlanStatus, Prisma, type ServicePlan } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import type {
  BillingPeriodValue,
  CreateServicePlanInput,
  PlanStatusValue,
  ServicePlanRecord,
  ServicePlanRepository,
  UpdateServicePlanInput,
} from "@/server/repositories/contracts/service-plan-repository";

const statusToDb: Record<PlanStatusValue, PlanStatus> = {
  draft: PlanStatus.DRAFT,
  active: PlanStatus.ACTIVE,
  archived: PlanStatus.ARCHIVED,
};

const periodToDb: Record<BillingPeriodValue, BillingPeriod> = {
  monthly: BillingPeriod.MONTHLY,
  quarterly: BillingPeriod.QUARTERLY,
  yearly: BillingPeriod.YEARLY,
  custom: BillingPeriod.CUSTOM,
};

function toRecord(plan: ServicePlan): ServicePlanRecord {
  return {
    id: plan.id,
    serviceId: plan.serviceId,
    code: plan.code,
    name: plan.name,
    description: plan.description,
    status: plan.status.toLowerCase() as PlanStatusValue,
    billingPeriod: plan.billingPeriod.toLowerCase() as BillingPeriodValue,
    customDurationDays: plan.customDurationDays,
    priceAmount: plan.priceAmount.toString(),
    currency: plan.currency,
    trialDays: plan.trialDays,
    isPublic: plan.isPublic,
    sortOrder: plan.sortOrder,
    features: Array.isArray(plan.features) ? plan.features.filter((item): item is string => typeof item === "string") : [],
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

function data(input: CreateServicePlanInput | UpdateServicePlanInput): Prisma.ServicePlanUncheckedCreateInput | Prisma.ServicePlanUncheckedUpdateInput {
  return {
    ...input,
    status: input.status ? statusToDb[input.status] : undefined,
    billingPeriod: input.billingPeriod ? periodToDb[input.billingPeriod] : undefined,
    features: input.features as Prisma.InputJsonValue | undefined,
  };
}

export class DatabaseServicePlanRepository implements ServicePlanRepository {
  async list(serviceId?: string) {
    return (await getPrismaClient().servicePlan.findMany({
      where: serviceId ? { serviceId } : undefined,
      orderBy: [{ serviceId: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    })).map(toRecord);
  }

  async findById(id: string) {
    const plan = await getPrismaClient().servicePlan.findUnique({ where: { id } });
    return plan ? toRecord(plan) : null;
  }

  async findByCode(serviceId: string, code: string) {
    const plan = await getPrismaClient().servicePlan.findUnique({
      where: { serviceId_code: { serviceId, code } },
    });
    return plan ? toRecord(plan) : null;
  }

  async create(input: CreateServicePlanInput) {
    return toRecord(await getPrismaClient().servicePlan.create({ data: data(input) as Prisma.ServicePlanUncheckedCreateInput }));
  }

  async update(id: string, input: UpdateServicePlanInput) {
    try {
      return toRecord(await getPrismaClient().servicePlan.update({
        where: { id },
        data: data(input) as Prisma.ServicePlanUncheckedUpdateInput,
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return null;
      throw error;
    }
  }
}
