export type CatalogService = {
  id: string;
  name: string;
  description?: string | null;
  slug?: string;
};


export async function getCatalogServicesApi() {

  const response = await fetch("/api/v1/catalog/services");


  if (!response.ok) {
    throw new Error("دریافت کاتالوگ سرویس‌ها انجام نشد.");
  }


  const data = await response.json();


  return {
    services: data.services ?? [],
  } as {
    services: CatalogService[];
  };

}
