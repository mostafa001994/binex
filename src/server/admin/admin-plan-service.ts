import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { ConflictApiError, NotFoundApiError, ValidationApiError } from "@/server/core/api-error";
import { getAuditRepository, getServiceCatalogRepository, getServicePlanRepository } from "@/server/repositories/repository-provider";
import type { BillingPeriodValue, CreateServicePlanInput, PlanStatusValue, ServicePlanRecord, UpdateServicePlanInput } from "@/server/repositories/contracts/service-plan-repository";

const statuses = new Set<PlanStatusValue>(["draft", "active", "archived"]);
const periods = new Set<BillingPeriodValue>(["monthly", "quarterly", "yearly", "custom"]);

function text(value: unknown, label: string, max: number, optional = false) {
  const result = String(value ?? "").trim();
  if (!result && !optional) throw new ValidationApiError(`${label} الزامی است.`);
  if (result.length > max) throw new ValidationApiError(`${label} بیش از حد طولانی است.`);
  return result || null;
}

function integer(value: unknown, label: string, min: number, max: number) {
  const result = Number(value);
  if (!Number.isInteger(result) || result < min || result > max) {
    throw new ValidationApiError(`${label} معتبر نیست.`);
  }
  return result;
}

function price(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!/^\d+$/.test(raw)) throw new ValidationApiError("مبلغ پلن باید عدد صحیح و برحسب ریال باشد.");
  const result = BigInt(raw);
  if (result < 0n) throw new ValidationApiError("مبلغ پلن نمی‌تواند منفی باشد.");
  return result;
}

function features(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 30);
}

function normalize(body: Record<string, unknown>, creating: boolean): CreateServicePlanInput | UpdateServicePlanInput {
  const status = String(body.status ?? "draft") as PlanStatusValue;
  const billingPeriod = String(body.billingPeriod ?? "monthly") as BillingPeriodValue;
  if (!statuses.has(status)) throw new ValidationApiError("وضعیت پلن معتبر نیست.");
  if (!periods.has(billingPeriod)) throw new ValidationApiError("دوره پلن معتبر نیست.");

  const customDurationDays = billingPeriod === "custom"
    ? integer(body.customDurationDays, "تعداد روز دوره سفارشی", 1, 3650)
    : null;

  const common = {
    name: text(body.name, "نام پلن", 120) as string,
    description: text(body.description, "توضیحات", 2000, true),
    status,
    billingPeriod,
    customDurationDays,
    priceAmount: price(body.priceAmount),
    currency: "IRR",
    trialDays: integer(body.trialDays ?? 0, "روزهای آزمایشی", 0, 365),
    isPublic: body.isPublic !== false,
    sortOrder: integer(body.sortOrder ?? 0, "ترتیب نمایش", -10000, 10000),
    features: features(body.features),
  };

  if (!creating) return common;
  const serviceId = String(body.serviceId ?? "").trim();
  const code = String(body.code ?? "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(code)) {
    throw new ValidationApiError("کد پلن باید انگلیسی و شامل حروف، عدد یا خط تیره باشد.");
  }
  return { ...common, serviceId, code };
}

async function assertServiceCanPublish(serviceId: string, status: PlanStatusValue) {
  const service = await getServiceCatalogRepository().findById(serviceId);
  if (!service) throw new NotFoundApiError("سرویس پیدا نشد.");
  if (status === "active" && (service.status !== "active" || service.availability !== "available")) {
    throw new ConflictApiError("برای فعال‌سازی پلن، سرویس باید فعال و قابل ارائه باشد.");
  }
  return service;
}

export async function listAdminPlans(user: AuthUser, serviceId?: string) {
  requireAdminPermission(user, "admin.plans.read");
  return getServicePlanRepository().list(serviceId);
}

export async function createAdminPlan(user: AuthUser, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.plans.manage");
  const input = normalize(body, true) as CreateServicePlanInput;
  await assertServiceCanPublish(input.serviceId, input.status);
  const repository = getServicePlanRepository();
  if (await repository.findByCode(input.serviceId, input.code)) throw new ConflictApiError("این کد قبلاً برای سرویس استفاده شده است.");
  const plan = await repository.create(input);
  await audit(user, "service_plan_created", plan, {});
  return plan;
}

export async function updateAdminPlan(user: AuthUser, planId: string, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.plans.manage");
  const repository = getServicePlanRepository();
  const before = await repository.findById(planId);
  if (!before) throw new NotFoundApiError("پلن پیدا نشد.");
  const input = normalize({ ...before, ...body }, false) as UpdateServicePlanInput;
  await assertServiceCanPublish(before.serviceId, input.status ?? before.status);
  const plan = await repository.update(planId, input);
  if (!plan) throw new NotFoundApiError("پلن پیدا نشد.");
  await audit(user, plan.status === "archived" && before.status !== "archived" ? "service_plan_archived" : "service_plan_updated", plan, {
    beforeStatus: before.status,
    afterStatus: plan.status,
    beforePriceAmount: before.priceAmount,
    afterPriceAmount: plan.priceAmount,
  });
  return plan;
}

async function audit(user: AuthUser, action: "service_plan_created" | "service_plan_updated" | "service_plan_archived", plan: ServicePlanRecord, metadata: Record<string, string>) {
  await getAuditRepository().create({
    actorUserId: user.id,
    action,
    targetType: "service-plan",
    targetId: plan.id,
    metadata: { serviceId: plan.serviceId, planCode: plan.code, planName: plan.name, ...metadata },
  });
}
