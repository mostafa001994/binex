import type { IconKey } from "@/constants/icon-registry";
import type { ServiceMarketingContent } from "@/types/service-marketing";

export type PublicServiceItem = {
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
  marketingContent: ServiceMarketingContent;
  createdAt: string;
  updatedAt: string;
};

type ApiFailure = {
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
      (payload as ApiFailure)
        .error?.message ||
        "دریافت سرویس‌ها انجام نشد.",
    );
  }

  return payload.data as T;
}

export function getPublicServicesApi() {
  return getJson<{
    services: PublicServiceItem[];
  }>("/api/v1/catalog/services");
}

export function getPublicServiceApi(
  slug: string,
) {
  return getJson<{
    service: PublicServiceItem;
  }>(
    `/api/v1/catalog/services/${slug}`,
  );
}
