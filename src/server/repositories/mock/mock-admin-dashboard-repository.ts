import { getMockAuthStore } from "@/server/repositories/mock/mock-auth-store";
import { getMockBusinessStore } from "@/server/repositories/mock/mock-business-store";
import type { AdminDashboardRepository } from "@/server/repositories/contracts/admin-dashboard-repository";

export class MockAdminDashboardRepository implements AdminDashboardRepository {
  async getSnapshot() {
    const auth = getMockAuthStore();
    const business = getMockBusinessStore();
    return {
      users: auth.users.length,
      businesses: business.businesses.length,
      suspendedBusinesses: business.businesses.filter((item) => item.status === "suspended").length,
      activeServices: business.services.filter((item) => item.status === "active").length,
      setupServices: business.services.filter((item) => item.status === "setup").length,
      pausedServices: business.services.filter((item) => item.status === "paused").length,
      activeSubscriptions: 0, pastDueSubscriptions: 0, pendingOrders: 0, failedPayments: 0,
      queuedProvisioning: 0, failedProvisioning: 0, paidVolume30d: "0",
    };
  }
}
