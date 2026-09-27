import { AutomationConnectorStatus, ProvisioningJobStatus } from "@/generated/prisma/client";
import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { NotFoundApiError, ValidationApiError } from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { encryptSecret } from "@/server/security/secret-crypto";
import { getAuditRepository } from "@/server/repositories/repository-provider";

type ConnectorStatus = "draft" | "active" | "disabled";
const statusToDb: Record<ConnectorStatus, AutomationConnectorStatus> = {
  draft: AutomationConnectorStatus.DRAFT,
  active: AutomationConnectorStatus.ACTIVE,
  disabled: AutomationConnectorStatus.DISABLED,
};
function kebab(value: string) { return value.toLowerCase().replaceAll("_", "-"); }

export function validateConnectorStatus(value: string): value is ConnectorStatus {
  return Object.hasOwn(statusToDb, value);
}

function validEndpoint(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch { return false; }
}

export async function listAdminAutomationConnectors(user: AuthUser) {
  requireAdminPermission(user, "admin.provisioning.read");
  const prisma = getPrismaClient();
  const [services, connectors, groupedJobs] = await Promise.all([
    prisma.serviceDefinition.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, shortName: true, availability: true, status: true } }),
    prisma.automationConnector.findMany(),
    prisma.provisioningJob.groupBy({ by: ["serviceId", "status"], _count: { _all: true } }),
  ]);
  return services.map((service) => {
    const connector = connectors.find((item) => item.serviceId === service.id);
    const jobs = groupedJobs.filter((item) => item.serviceId === service.id);
    const count = (status: ProvisioningJobStatus) => jobs.find((item) => item.status === status)?._count._all ?? 0;
    return {
      service: { ...service, availability: kebab(service.availability), status: kebab(service.status) },
      connector: connector ? {
        id: connector.id,
        status: kebab(connector.status) as ConnectorStatus,
        endpointConfigured: Boolean(connector.endpointEncrypted),
        authSecretConfigured: Boolean(connector.authSecretEncrypted),
        contractVersion: connector.contractVersion,
        timeoutSeconds: connector.timeoutSeconds,
        updatedAt: connector.updatedAt.toISOString(),
      } : null,
      queue: {
        pending: count(ProvisioningJobStatus.PENDING),
        processing: count(ProvisioningJobStatus.PROCESSING),
        succeeded: count(ProvisioningJobStatus.SUCCEEDED),
        failed: count(ProvisioningJobStatus.FAILED),
      },
    };
  });
}

export async function updateAdminAutomationConnector(user: AuthUser, serviceId: string, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.provisioning.manage");
  const prisma = getPrismaClient();
  const service = await prisma.serviceDefinition.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!service) throw new NotFoundApiError("سرویس پیدا نشد.");
  const existing = await prisma.automationConnector.findUnique({ where: { serviceId } });
  const statusValue = typeof body.status === "string" ? body.status : "draft";
  if (!validateConnectorStatus(statusValue)) throw new ValidationApiError("وضعیت اتصال معتبر نیست.");
  const timeoutSeconds = typeof body.timeoutSeconds === "number" ? body.timeoutSeconds : Number(body.timeoutSeconds ?? 30);
  if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 5 || timeoutSeconds > 120) throw new ValidationApiError("مهلت اجرای اتصال باید بین ۵ تا ۱۲۰ ثانیه باشد.");
  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (endpoint && !validEndpoint(endpoint)) throw new ValidationApiError("آدرس webhook باید با http یا https آغاز شود.");
  const authSecret = typeof body.authSecret === "string" ? body.authSecret.trim() : "";
  if (authSecret && authSecret.length > 2000) throw new ValidationApiError("مقدار احراز هویت بیش از حد طولانی است.");
  const endpointEncrypted = endpoint ? encryptSecret(endpoint) : existing?.endpointEncrypted ?? null;
  if (statusValue === "active" && !endpointEncrypted) throw new ValidationApiError("برای فعال‌سازی اتصال باید endpoint ثبت شود.");
  const connector = await prisma.automationConnector.upsert({
    where: { serviceId },
    create: { serviceId, status: statusToDb[statusValue], endpointEncrypted, authSecretEncrypted: authSecret ? encryptSecret(authSecret) : null, timeoutSeconds, contractVersion: "v1" },
    update: { status: statusToDb[statusValue], endpointEncrypted, authSecretEncrypted: authSecret ? encryptSecret(authSecret) : existing?.authSecretEncrypted ?? null, timeoutSeconds },
  });
  await getAuditRepository().create({
    actorUserId: user.id,
    action: "automation_connector_updated",
    targetType: "automation-connector",
    targetId: serviceId,
    metadata: { serviceId, beforeStatus: existing ? kebab(existing.status) : null, afterStatus: statusValue, endpointReplaced: Boolean(endpoint), authSecretReplaced: Boolean(authSecret) },
  });
  return { id: connector.id, serviceId, status: statusValue, endpointConfigured: Boolean(connector.endpointEncrypted), authSecretConfigured: Boolean(connector.authSecretEncrypted), contractVersion: connector.contractVersion, timeoutSeconds: connector.timeoutSeconds, updatedAt: connector.updatedAt.toISOString() };
}

export async function clearAdminAutomationConnector(user: AuthUser, serviceId: string) {
  requireAdminPermission(user, "admin.provisioning.manage");
  const prisma = getPrismaClient();
  const existing = await prisma.automationConnector.findUnique({ where: { serviceId } });
  if (!existing) throw new NotFoundApiError("اتصال سرویس پیدا نشد.");
  const connector = await prisma.automationConnector.update({ where: { serviceId }, data: { status: AutomationConnectorStatus.DRAFT, endpointEncrypted: null, authSecretEncrypted: null } });
  await getAuditRepository().create({ actorUserId: user.id, action: "automation_connector_cleared", targetType: "automation-connector", targetId: serviceId, metadata: { serviceId, beforeStatus: kebab(existing.status) } });
  return { id: connector.id, serviceId, status: "draft" as const, endpointConfigured: false, authSecretConfigured: false, contractVersion: connector.contractVersion, timeoutSeconds: connector.timeoutSeconds, updatedAt: connector.updatedAt.toISOString() };
}
