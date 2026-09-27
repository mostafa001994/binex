import type { IconKey } from "@/constants/icon-registry";

export type ServiceApiItem = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  appHref: string | null;
  marketingHref: string;
  availability:
    | "available"
    | "coming-soon";
  status:
    | "draft"
    | "active"
    | "disabled";
  visibility:
    | "public"
    | "private";
  accent: string;
  iconKey: IconKey;
  sortOrder: number;
  features: string[];
  businessServiceId: string | null;
  businessStatus:
    | "setup"
    | "active"
    | "paused"
    | "coming-soon"
    | "not-enabled";
  setupCompleted: boolean;
  journey: {
    status:
      | "coming-soon"
      | "not-enabled"
      | "awaiting-activation"
      | "setup-required"
      | "provisioning"
      | "ready"
      | "payment-required"
      | "setup-failed"
      | "paused"
      | "ended";
    label: string;
    description: string;
    nextAction: {
      kind:
        | "view-offer"
        | "open-service"
        | "view-billing"
        | "contact-support"
        | "wait"
        | "none";
      label: string;
      href: string | null;
    };
    subscriptionId: string | null;
  };
};

export type ServiceApiAccess = {
  role: "owner" | "admin" | "member";
  canManageBilling: boolean;
};

type ErrorPayload = {
  success: false;
  error: {
    message: string;
  };
};

async function getJson<T>(
  url: string,
) {
  const response = await fetch(url, {
    headers: {
      Accept:
        "application/json",
    },
  });

  const payload =
    await response.json();

  if (
    !response.ok ||
    !payload.success
  ) {
    throw new Error(
      (payload as ErrorPayload)
        .error?.message ||
        "خطا در دریافت اطلاعات.",
    );
  }

  return payload.data as T;
}

export function getServicesApi() {
  return getJson<{
    services: ServiceApiItem[];
    access: ServiceApiAccess;
  }>("/api/v1/services");
}

export function getServiceApi(
  serviceId: string,
) {
  return getJson<{
    service: ServiceApiItem;
    access: ServiceApiAccess;
  }>(
    `/api/v1/services/${serviceId}`,
  );
}
