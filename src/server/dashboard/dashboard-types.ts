import type { AuthUser } from "@/server/auth/auth-types";
import type { Business, BusinessMember } from "@/server/business/business-types";
import type { DataDriver } from "@/server/config/data-driver";
import type { ServiceWithBusinessState } from "@/server/services/service-types";

export type DashboardNextAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  kind: "service" | "billing" | "support" | "notification";
  priority: "high" | "medium" | "low";
  serviceId?: ServiceWithBusinessState["id"];
};

export type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  href: string | null;
  kind: string;
  readAt: string | null;
  createdAt: string;
};

export type DashboardPayload = {
  mode: DataDriver;
  user: AuthUser;
  business: Business;
  membership: BusinessMember;
  services: ServiceWithBusinessState[];
  summary: {
    enabledServices: number;
    readyServices: number;
    subscriptionCount: number | null;
    subscriptionNeedsAttention: number | null;
    openOrders: number | null;
    unreadNotifications: number;
    openTickets: number;
  };
  nextActions: DashboardNextAction[];
  recentNotifications: DashboardNotification[];
};
