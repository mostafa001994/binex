import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { getServicePlanRepository } from "@/server/repositories/repository-provider";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(
  async () => {
    const repository = getServicePlanRepository();
    const plans = await repository.list();

    const purchasablePlans = plans
      .filter(
        (plan) =>
          plan.status === "active" &&
          plan.isPublic &&
          BigInt(plan.priceAmount) > 0n,
      )
      .map((plan) => ({
        id: plan.id,
        serviceId: plan.serviceId,
        code: plan.code,
        name: plan.name,
        description: plan.description,
        billingPeriod: plan.billingPeriod,
        customDurationDays: plan.customDurationDays,
        priceAmount: plan.priceAmount,
        currency: plan.currency,
        trialDays: plan.trialDays,
        sortOrder: plan.sortOrder,
        features: plan.features,
      }));

    return apiSuccess({
      plans: purchasablePlans,
    });
  },
);
