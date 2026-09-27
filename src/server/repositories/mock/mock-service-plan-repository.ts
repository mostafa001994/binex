import type {
  CreateServicePlanInput,
  ServicePlanRecord,
  ServicePlanRepository,
  UpdateServicePlanInput,
} from "@/server/repositories/contracts/service-plan-repository";

const plans: ServicePlanRecord[] = [];

export class MockServicePlanRepository implements ServicePlanRepository {
  async list(serviceId?: string) {
    return plans.filter((item) => !serviceId || item.serviceId === serviceId);
  }
  async findById(id: string) {
    return plans.find((item) => item.id === id) ?? null;
  }
  async findByCode(serviceId: string, code: string) {
    return plans.find((item) => item.serviceId === serviceId && item.code === code) ?? null;
  }
  async create(input: CreateServicePlanInput) {
    const now = new Date().toISOString();
    const plan: ServicePlanRecord = { ...input, id: crypto.randomUUID(), priceAmount: input.priceAmount.toString(), createdAt: now, updatedAt: now };
    plans.push(plan);
    return plan;
  }
  async update(id: string, input: UpdateServicePlanInput) {
    const index = plans.findIndex((item) => item.id === id);
    if (index < 0) return null;
    plans[index] = { ...plans[index], ...input, priceAmount: input.priceAmount?.toString() ?? plans[index].priceAmount, updatedAt: new Date().toISOString() };
    return plans[index];
  }
}
