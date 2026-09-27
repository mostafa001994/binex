import type { ServiceId } from "@/constants/services-config";

/**
 * Front-end preview state. Replace this module with the authenticated account
 * response when backend subscriptions are available.
 */
export const accountPreview = {
  mode: "demo" as const,
  activeServiceIds: ["sales-agent", "excel-analyzer"] as ServiceId[],
};

export function isServiceActive(serviceId: ServiceId) {
  return accountPreview.activeServiceIds.includes(serviceId);
}
