import type { AuthUser } from "@/server/auth/auth-types";
import {
  getCurrentBusinessContext,
} from "@/server/business/business-service";
import type {
  CurrentBusinessContext,
} from "@/server/business/business-types";
import {
  getServiceCatalogRepository,
} from "@/server/repositories/repository-provider";
import type {
  ServiceId,
  ServiceJourney,
  ServiceWithBusinessState,
} from "@/server/services/service-types";
import { NotFoundApiError } from "@/server/core/api-error";
import { requireBusinessActive } from "@/server/business/business-access";
import { getSubscriptionRepository } from "@/server/repositories/repository-provider";
import { getCustomerSubscriptionLifecycle } from "@/server/subscriptions/customer-subscription-service";
import type { AdminSubscriptionRecord } from "@/server/repositories/contracts/subscription-repository";

function serviceAppHref(service: { id: string; appHref: string | null }) {
  return service.appHref ?? `/app/services/${service.id}`;
}

function baseJourney(service: {
  id: string;
  appHref: string | null;
  marketingHref: string;
  businessStatus: ServiceWithBusinessState["businessStatus"];
  setupCompleted: boolean;
}): ServiceJourney {
  if (service.businessStatus === "coming-soon") {
    return {
      status: "coming-soon",
      label: "به‌زودی",
      description: "این سرویس هنوز برای استفاده عمومی منتشر نشده است.",
      nextAction: { kind: "view-offer", label: "مشاهده معرفی سرویس", href: service.marketingHref },
      subscriptionId: null,
    };
  }

  if (service.businessStatus === "not-enabled") {
    return {
      status: "not-enabled",
      label: "فعال نشده",
      description: "هنوز دسترسی این کسب‌وکار به سرویس فعال نشده است.",
      nextAction: { kind: "view-offer", label: "مشاهده راهکار", href: service.marketingHref },
      subscriptionId: null,
    };
  }

  if (service.businessStatus === "paused") {
    return {
      status: "paused",
      label: "متوقف",
      description: "دسترسی این سرویس موقتاً متوقف شده است.",
      nextAction: { kind: "contact-support", label: "پیگیری از پشتیبانی", href: "/app/support" },
      subscriptionId: null,
    };
  }

  if (service.businessStatus === "setup" || !service.setupCompleted) {
    return {
      status: "setup-required",
      label: "نیازمند راه‌اندازی",
      description: "دسترسی ایجاد شده و تنظیمات اولیه سرویس باید تکمیل شود.",
      nextAction: { kind: "open-service", label: "ادامه راه‌اندازی", href: serviceAppHref(service) },
      subscriptionId: null,
    };
  }

  return {
    status: "ready",
    label: "آماده استفاده",
    description: "سرویس برای این کسب‌وکار فعال و آماده استفاده است.",
    nextAction: { kind: "open-service", label: "ورود به سرویس", href: serviceAppHref(service) },
    subscriptionId: null,
  };
}

function subscriptionJourney(
  service: ServiceWithBusinessState,
  subscription: AdminSubscriptionRecord,
): ServiceJourney {

console.log("SA DEBUG", {
  serviceId: service.id,
  businessStatus: service.businessStatus,
  setupCompleted: service.setupCompleted,
  subscriptionStatus: subscription.status,
  provisioningStatus: subscription.provisioningStatus,
});

  const lifecycle = getCustomerSubscriptionLifecycle(subscription);
console.log("SA LIFECYCLE DEBUG", {
  lifecycle,
  rawSubscription: {
    status: subscription.status,
    provisioningStatus: subscription.provisioningStatus,
  },
});

  const subscriptionId = subscription.id;

  switch (lifecycle.status) {
    case "pending":
      return {
        status: "awaiting-activation",
        label: "در انتظار فعال‌سازی",
        description: "اشتراک ثبت شده و منتظر تأیید یا فعال‌سازی است.",
        nextAction: { kind: "wait", label: "در انتظار فعال‌سازی", href: null },
        subscriptionId,
      };
    case "setup-required":
      return { ...baseJourney({ ...service, businessStatus: "setup", setupCompleted: false }), subscriptionId };
    case "provisioning":
      return {
        status: "provisioning",
        label: "در حال راه‌اندازی",
        description: "تنظیمات سیستمی سرویس در حال انجام است.",
        nextAction: { kind: "wait", label: "در حال پردازش", href: null },
        subscriptionId,
      };
    case "payment-required":
      return {
        status: "payment-required",
        label: "نیازمند پرداخت",
        description: "برای ادامه دسترسی، وضعیت پرداخت اشتراک باید تعیین تکلیف شود.",
        nextAction: { kind: "view-billing", label: "مشاهده پرداخت‌ها", href: "/app/billing" },
        subscriptionId,
      };
    case "setup-failed":
      return {
        status: "setup-failed",
        label: "خطا در راه‌اندازی",
        description: "راه‌اندازی خودکار کامل نشده و نیازمند پیگیری است.",
        nextAction: { kind: "contact-support", label: "ثبت تیکت پشتیبانی", href: "/app/support" },
        subscriptionId,
      };
    case "paused":
      return { ...baseJourney({ ...service, businessStatus: "paused" }), subscriptionId };
    case "ended":
      return {
        status: "ended",
        label: "پایان‌یافته",
        description: "این اشتراک پایان یافته است.",
        nextAction: { kind: "view-billing", label: "مشاهده اشتراک", href: "/app/billing" },
        subscriptionId,
      };


case "trial":
case "active":
  return {
    ...baseJourney({
      ...service,
      businessStatus: service.businessStatus,
      setupCompleted: service.setupCompleted,
    }),
    subscriptionId,
  };


  }
}

export async function listPublicServices() {
  const catalog =
    await getServiceCatalogRepository().list();

  return catalog.filter(
    (service) =>
      service.status === "active" &&
      service.visibility === "public",
  );
}

export async function getPublicServiceBySlug(
  slug: string,
) {
  const service =
    await getServiceCatalogRepository().findBySlug(
      slug,
    );

  if (
    !service ||
    service.status !== "active" ||
    service.visibility !== "public"
  ) {
    throw new NotFoundApiError(
      "سرویس موردنظر پیدا نشد.",
    );
  }

  return service;
}

export async function listServicesForBusinessContext(
  context: CurrentBusinessContext,
): Promise<ServiceWithBusinessState[]> {
  const catalog =
    await getServiceCatalogRepository().list();

  return catalog

.filter((service) => {
  if (
    service.status !== "active"
  ) {
    return false;
  }

  const assigned =
    context.services.some(
      (item) =>
        item.serviceId === service.id,
    );

  return assigned;
})


    .map((service) => {
      const businessService =
        context.services.find(
          (item) =>
            item.serviceId ===
            service.id,
        );


console.log("SA BUSINESS SERVICE DEBUG", {
  serviceId: service.id,
  contextServices: context.services,
  businessService,
});

      const businessStatus: ServiceWithBusinessState["businessStatus"] =
        businessService?.status ??
        (service.availability === "coming-soon"
          ? "coming-soon"
          : "not-enabled");

      const baseService = {
        ...service,
        businessServiceId:
          businessService?.id ??
          null,
        businessStatus,
        setupCompleted:
          businessService?.setupCompleted ??
          false,
      };

      return {
        ...baseService,
        journey: baseJourney(baseService),
      };
    });
}

export async function listServicesForUser(
  user: AuthUser,
): Promise<{
  services: ServiceWithBusinessState[];
  access: { role: CurrentBusinessContext["membership"]["role"]; canManageBilling: boolean };
}> {
  const context = requireBusinessActive(await getCurrentBusinessContext(user));
  const services = await listServicesForBusinessContext(context);

console.log("FINAL SERVICES DEBUG", {
  businessId: context.business.id,
  services: services.map((s)=>({
    id:s.id,
    businessStatus:s.businessStatus,
    setupCompleted:s.setupCompleted
  }))
});


  const canManageBilling = context.membership.role === "owner";

  if (canManageBilling) {
    const subscriptions = await getSubscriptionRepository().listForBusiness(context.business.id);
    const latestByService = new Map<string, AdminSubscriptionRecord>();

    for (const subscription of subscriptions) {
      if (!latestByService.has(subscription.serviceId)) {
        latestByService.set(subscription.serviceId, subscription);
      }
    }

    for (const service of services) {
      const subscription = latestByService.get(service.id);
      if (subscription) service.journey = subscriptionJourney(service, subscription);
    }
  }

  return {
    services,
    access: { role: context.membership.role, canManageBilling },
  };
}

export async function getServiceForUser(
  user: AuthUser,
  serviceId: ServiceId,
) {
  const snapshot = await listServicesForUser(user);

  const service = snapshot.services.find(
    (item) =>
      item.id === serviceId,
  );

  if (!service) {
    throw new NotFoundApiError(
      "سرویس موردنظر پیدا نشد.",
    );
  }

  return { service, access: snapshot.access };
}
