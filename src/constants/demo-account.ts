export { accountPreview, isServiceActive } from "@/constants/account-state";
export { accountPreview as demoAccount } from "@/constants/account-state";
import { accountPreview } from "@/constants/account-state";
export const demoActiveServiceIds = accountPreview.activeServiceIds;
export const isDemoServiceActive = (serviceId: (typeof accountPreview.activeServiceIds)[number]) => accountPreview.activeServiceIds.includes(serviceId);
