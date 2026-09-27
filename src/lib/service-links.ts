export type ServiceLinkSource = {
  id: string;
  appHref: string | null;
  marketingHref: string;
  availability: "available" | "coming-soon";
};

export function getServiceAppHref(
  service: ServiceLinkSource,
) {
  if (
    service.availability ===
    "coming-soon"
  ) {
    return service.marketingHref;
  }

  return (
    service.appHref ??
    `/app/services/${service.id}`
  );
}
