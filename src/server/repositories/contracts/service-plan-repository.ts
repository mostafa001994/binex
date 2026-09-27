export type PlanStatusValue = "draft" | "active" | "archived";
export type BillingPeriodValue = "monthly" | "quarterly" | "yearly" | "custom";

export type ServicePlanRecord = {
  id: string;
  serviceId: string;
  code: string;
  name: string;
  description: string | null;
  status: PlanStatusValue;
  billingPeriod: BillingPeriodValue;
  customDurationDays: number | null;
  priceAmount: string;
  currency: string;
  trialDays: number;
  isPublic: boolean;
  sortOrder: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateServicePlanInput = Omit<ServicePlanRecord, "id" | "createdAt" | "updatedAt" | "priceAmount"> & {
  priceAmount: bigint;
};

export type UpdateServicePlanInput = Partial<Omit<CreateServicePlanInput, "serviceId" | "code">>;

export interface ServicePlanRepository {
  list(serviceId?: string): Promise<ServicePlanRecord[]>;
  findById(id: string): Promise<ServicePlanRecord | null>;
  findByCode(serviceId: string, code: string): Promise<ServicePlanRecord | null>;
  create(input: CreateServicePlanInput): Promise<ServicePlanRecord>;
  update(id: string, input: UpdateServicePlanInput): Promise<ServicePlanRecord | null>;
}
