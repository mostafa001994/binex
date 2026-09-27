import { getSystemRepository } from "@/server/repositories/repository-provider";
import type { HealthPayload, MetaPayload } from "@/types/api/common";

export async function getHealthPayload(): Promise<HealthPayload> {
  const repository = getSystemRepository();
  const snapshot = await repository.getSnapshot();

  return {
    status: snapshot.databaseConnected || snapshot.dataDriver === "mock"
      ? "ok"
      : "degraded",
    service: "binix-api",
    version: "v1",
    dataDriver: snapshot.dataDriver,
    timestamp: new Date().toISOString(),
  };
}

export function getMetaPayload(): MetaPayload {
  return {
    product: {
      name: "Binix",
      apiVersion: "v1",
      locale: "fa-IR",
      direction: "rtl",
    },
    capabilities: {
      auth: "foundation",
      admin: "planned",
      database: "not-connected",
    },
  };
}
