import {
  BusinessServiceStatus,
  BusinessStatus,
  OrderStatus,
  PaymentStatus,
  ProvisioningJobStatus,
  SubscriptionStatus,
} from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import type { AdminDashboardRepository } from "@/server/repositories/contracts/admin-dashboard-repository";

export class DatabaseAdminDashboardRepository implements AdminDashboardRepository {
  async getSnapshot() {
    const prisma = getPrismaClient();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      users, businesses, suspendedBusinesses, activeServices, setupServices, pausedServices,
      activeSubscriptions, pastDueSubscriptions, pendingOrders, failedPayments,
      queuedProvisioning, failedProvisioning, paidVolume,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.business.count({ where: { status: { not: BusinessStatus.ARCHIVED } } }),
      prisma.business.count({ where: { status: BusinessStatus.SUSPENDED } }),
      prisma.businessService.count({ where: { status: BusinessServiceStatus.ACTIVE } }),
      prisma.businessService.count({ where: { status: BusinessServiceStatus.SETUP } }),
      prisma.businessService.count({ where: { status: BusinessServiceStatus.PAUSED } }),
      prisma.subscription.count({ where: { status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } } }),
      prisma.subscription.count({ where: { status: SubscriptionStatus.PAST_DUE } }),
      prisma.order.count({ where: { status: OrderStatus.PENDING_PAYMENT } }),
      prisma.payment.count({ where: { status: PaymentStatus.FAILED, order: { status: OrderStatus.PAYMENT_FAILED } } }),
      prisma.provisioningJob.count({ where: { status: ProvisioningJobStatus.PENDING } }),
      prisma.provisioningJob.count({ where: { status: ProvisioningJobStatus.FAILED } }),
      prisma.order.aggregate({ where: { status: OrderStatus.PAID, paidAt: { gte: since } }, _sum: { totalAmount: true } }),
    ]);
    return {
      users, businesses, suspendedBusinesses, activeServices, setupServices, pausedServices,
      activeSubscriptions, pastDueSubscriptions, pendingOrders, failedPayments,
      queuedProvisioning, failedProvisioning,
      paidVolume30d: (paidVolume._sum.totalAmount ?? 0n).toString(),
    };
  }
}
