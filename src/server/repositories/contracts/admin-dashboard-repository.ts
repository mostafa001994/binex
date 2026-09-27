export type AdminDashboardSnapshot = {
  users: number;
  businesses: number;
  suspendedBusinesses: number;
  activeServices: number;
  setupServices: number;
  pausedServices: number;
  activeSubscriptions: number;
  pastDueSubscriptions: number;
  pendingOrders: number;
  failedPayments: number;
  queuedProvisioning: number;
  failedProvisioning: number;
  paidVolume30d: string;
};

export interface AdminDashboardRepository {
  getSnapshot(): Promise<AdminDashboardSnapshot>;
}
