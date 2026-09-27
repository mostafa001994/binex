import type { ServiceApiItem } from "@/lib/api-client/services";
import type { AppRole } from "@/lib/roles";

export type DashboardApiPayload = {
  mode: "mock" | "database";
  user: {
    id: string;
    phone: string;
    name: string | null;
    role: AppRole;
    createdAt: string;
  };
  business: {
    id: string;
    name: string;
    phone: string | null;
    category: string | null;
    status: "active" | "suspended" | "archived";
    createdAt: string;
  };
  membership: {
    id: string;
    businessId: string;
    userId: string;
    role: "owner" | "admin" | "member";
    createdAt: string;
  };
  services: ServiceApiItem[];
  summary: {
    enabledServices: number;
    readyServices: number;
    subscriptionCount: number | null;
    subscriptionNeedsAttention: number | null;
    openOrders: number | null;
    unreadNotifications: number;
    openTickets: number;
  };
  nextActions: Array<{
    id: string;
    title: string;
    description: string;
    href: string;
    kind: "service" | "billing" | "support" | "notification";
    priority: "high" | "medium" | "low";
    serviceId?: string;
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    href: string | null;
    kind: string;
    readAt: string | null;
    createdAt: string;
  }>;
};

export async function getDashboardApi() {
  const response = await fetch("/api/v1/dashboard", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(
      payload.error?.message || "داشبورد قابل دریافت نیست.",
    );
  }

  return payload.data as DashboardApiPayload;
}
