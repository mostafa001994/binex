import { servicesConfig } from "@/constants/services-config";

export const products = servicesConfig.map((service) => ({
  id: service.id,
  title: service.name,
  category: service.category,
  description: service.description,
  href: service.href,
  icon: service.icon,
  availability: service.availability,
}));
