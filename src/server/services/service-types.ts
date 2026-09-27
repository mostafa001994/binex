import type { IconKey } from "@/constants/icon-registry";
import type { ServiceMarketingContent } from "@/types/service-marketing";

export type ServiceId = string;

export type ServiceAvailability =
  | "available"
  | "coming-soon";

export type ServiceCatalogStatus =
  | "draft"
  | "active"
  | "disabled";

export type ServiceVisibility =
  | "public"
  | "private";

export type ServiceDefinition = {
  id: ServiceId;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  appHref: string | null;
  marketingHref: string;
  availability: ServiceAvailability;
  status: ServiceCatalogStatus;
  visibility: ServiceVisibility;
  accent: string;
  iconKey: IconKey;
  sortOrder: number;
  features: string[];
  marketingContent: ServiceMarketingContent;
  createdAt: string;
  updatedAt: string;
};

export type ServiceOperationalStatus =
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

export type ServiceNextAction = {
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

export type ServiceJourney = {
  status: ServiceOperationalStatus;
  label: string;
  description: string;
  nextAction: ServiceNextAction;
  subscriptionId: string | null;
};

export type ServiceWithBusinessState =
  ServiceDefinition & {
    businessServiceId: string | null;
    businessStatus:
      | "setup"
      | "active"
      | "paused"
      | "coming-soon"
      | "not-enabled";
    setupCompleted: boolean;
    journey: ServiceJourney;
  };
