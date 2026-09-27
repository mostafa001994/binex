import type { DataDriver } from "@/server/config/data-driver";

export type BusinessStatus = "active" | "suspended" | "archived";
export type BusinessMemberRole = "owner" | "admin" | "member";

export type Business = {
  id: string;
  name: string;
  phone: string | null;
  category: string | null;
  status: BusinessStatus;
  archivedAt: string | null;
  createdAt: string;
};

export type BusinessMember = {
  id: string;
  businessId: string;
  userId: string;
  role: BusinessMemberRole;
  createdAt: string;
};

export type BusinessServiceStatus =
  | "setup"
  | "active"
  | "paused"
  | "coming-soon";

export type BusinessService = {
  id: string;
  businessId: string;
  serviceId: string;
  status: BusinessServiceStatus;
  setupCompleted: boolean;
  createdAt: string;
};

export type CurrentBusinessContext = {
  dataMode: DataDriver;
  business: Business;
  membership: BusinessMember;
  services: BusinessService[];
};
