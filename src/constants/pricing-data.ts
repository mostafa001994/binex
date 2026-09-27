import { servicesConfig } from "@/constants/services-config";

export const pricingPlans = servicesConfig.map((service) => ({
  id: service.id,
  name: service.name,
  category: service.category,
  description: service.description,
  purchaseModel: service.billingLabel,
  features: service.features,
  href: service.href,
  availability: service.availability,
}));
