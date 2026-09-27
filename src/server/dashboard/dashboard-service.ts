import type { AuthUser } from "@/server/auth/auth-types";
import { requireBusinessActive } from "@/server/business/business-access";
import { getCurrentBusinessContext } from "@/server/business/business-service";
import type {
  DashboardNextAction,
  DashboardPayload,
} from "@/server/dashboard/dashboard-types";
import type { AdminSubscriptionRecord } from "@/server/repositories/contracts/subscription-repository";
import {
  getCommerceRepository,
  getSubscriptionRepository,
} from "@/server/repositories/repository-provider";
import { listServicesForBusinessContext } from "@/server/services/services-service";
import { listMyNotifications, listMyTickets } from "@/server/support/support-service";
import { getCustomerSubscriptionLifecycle } from "@/server/subscriptions/customer-subscription-service";

type DashboardInputs = {
  services: DashboardPayload["services"];
  subscriptions: AdminSubscriptionRecord[];
  openOrders: number;
  tickets: Awaited<ReturnType<typeof listMyTickets>>;
  unreadNotifications: number;
};

function normalizedTicketStatus(status: unknown) {
  return String(status).toLowerCase().replaceAll("_", "-");
}

function buildNextActions({
  services,
  subscriptions,
  openOrders,
  tickets,
  unreadNotifications,
}: DashboardInputs): DashboardNextAction[] {
  const actions: DashboardNextAction[] = [];

  for (const subscription of subscriptions) {
    const lifecycle = getCustomerSubscriptionLifecycle(subscription);
    const service = services.find((item) => item.id === subscription.serviceId);

    if (lifecycle.status === "payment-required") {
      actions.push({
        id: `subscription-payment-${subscription.id}`,
        title: `پیگیری پرداخت ${subscription.serviceName}`,
        description: "وضعیت مالی این اشتراک نیازمند بررسی مالک کسب‌وکار است.",
        href: "/app/billing",
        kind: "billing",
        priority: "high",
        serviceId: subscription.serviceId,
      });
    } else if (lifecycle.status === "setup-failed") {
      actions.push({
        id: `subscription-failed-${subscription.id}`,
        title: `پیگیری راه‌اندازی ${subscription.serviceName}`,
        description: "راه‌اندازی کامل نشده است؛ برای بررسی وضعیت با پشتیبانی در تماس باشید.",
        href: "/app/support",
        kind: "support",
        priority: "high",
        serviceId: subscription.serviceId,
      });
    } else if (lifecycle.status === "setup-required") {
      actions.push({
        id: `subscription-setup-${subscription.id}`,
        title: `تکمیل راه‌اندازی ${subscription.serviceName}`,
        description: "اطلاعات اولیه سرویس را تکمیل کنید تا آماده استفاده شود.",
        href: service?.appHref || "/app/services",
        kind: "service",
        priority: "medium",
        serviceId: subscription.serviceId,
      });
    }
  }

  if (openOrders > 0) {
    actions.push({
      id: "open-orders",
      title: "بررسی سفارش‌های باز",
      description: `${openOrders.toLocaleString("fa-IR")} سفارش در انتظار تعیین تکلیف مالی است.`,
      href: "/app/billing",
      kind: "billing",
      priority: "high",
    });
  }

  const waitingTicket = tickets.find(
    (ticket) => normalizedTicketStatus(ticket.status) === "waiting-customer",
  );
  if (waitingTicket) {
    actions.push({
      id: `ticket-${waitingTicket.id}`,
      title: "پشتیبانی منتظر پاسخ شماست",
      description: waitingTicket.subject,
      href: "/app/support",
      kind: "support",
      priority: "high",
    });
  }

  if (unreadNotifications > 0) {
    actions.push({
      id: "unread-notifications",
      title: "اعلان‌های خوانده‌نشده",
      description: `${unreadNotifications.toLocaleString("fa-IR")} اعلان جدید در حساب شما وجود دارد.`,
      href: "/app/notifications",
      kind: "notification",
      priority: "medium",
    });
  }

  for (const service of services) {
    if (
      service.businessStatus === "setup" &&
      service.appHref &&
      !actions.some((item) => item.serviceId === service.id)
    ) {
      actions.push({
        id: `service-setup-${service.id}`,
        title: `تکمیل راه‌اندازی ${service.shortName}`,
        description: "تنظیمات اولیه این سرویس هنوز کامل نشده است.",
        href: service.appHref,
        kind: "service",
        priority: "medium",
        serviceId: service.id,
      });
    }
  }

  const priority = { high: 0, medium: 1, low: 2 } as const;
  return actions
    .sort((a, b) => priority[a.priority] - priority[b.priority])
    .slice(0, 4);
}

export async function getDashboardPayload(
  user: AuthUser,
): Promise<DashboardPayload> {
  const businessContext = requireBusinessActive(
    await getCurrentBusinessContext(user),
  );
  const isOwner = businessContext.membership.role === "owner";
  const servicesPromise = listServicesForBusinessContext(businessContext);
  const emptyNotifications: Awaited<ReturnType<typeof listMyNotifications>> = {
    unreadCount: 0,
    items: [],
  };
  const emptyTickets: Awaited<ReturnType<typeof listMyTickets>> = [];
  const supportPromise: Promise<
    [
      Awaited<ReturnType<typeof listMyNotifications>>,
      Awaited<ReturnType<typeof listMyTickets>>,
    ]
  > =
    businessContext.dataMode === "database"
      ? Promise.all([listMyNotifications(user), listMyTickets(user)])
      : Promise.resolve([emptyNotifications, emptyTickets]);
  const subscriptionsPromise = isOwner
    ? getSubscriptionRepository().listForBusiness(businessContext.business.id)
    : Promise.resolve([]);
  const openOrdersPromise = isOwner
    ? getCommerceRepository().countOpenOrdersForBusiness(
        businessContext.business.id,
      )
    : Promise.resolve(0);

  const [services, [notifications, tickets], subscriptions, openOrders] =
    await Promise.all([
      servicesPromise,
      supportPromise,
      subscriptionsPromise,
      openOrdersPromise,
    ]);

  const enabledServices = services.filter(
    (service) => service.businessServiceId !== null,
  );
  const subscriptionNeedsAttention = subscriptions.filter((subscription) => {
    const status = getCustomerSubscriptionLifecycle(subscription).status;
    return ["setup-required", "payment-required", "setup-failed"].includes(
      status,
    );
  }).length;
  const openTickets = tickets.filter(
    (ticket) =>
      !["resolved", "closed"].includes(
        normalizedTicketStatus(ticket.status),
      ),
  ).length;

  return {
    mode: businessContext.dataMode,
    user,
    business: businessContext.business,
    membership: businessContext.membership,
    services,
    summary: {
      enabledServices: enabledServices.length,
      readyServices: enabledServices.filter(
        (service) => service.businessStatus === "active",
      ).length,
      subscriptionCount: isOwner ? subscriptions.length : null,
      subscriptionNeedsAttention: isOwner ? subscriptionNeedsAttention : null,
      openOrders: isOwner ? openOrders : null,
      unreadNotifications: notifications.unreadCount,
      openTickets,
    },
    nextActions: buildNextActions({
      services,
      subscriptions,
      openOrders,
      tickets,
      unreadNotifications: notifications.unreadCount,
    }),
    recentNotifications: notifications.items.slice(0, 4).map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      href: item.href,
      kind: item.kind,
      readAt: item.readAt,
      createdAt: item.createdAt,
    })),
  };
}
