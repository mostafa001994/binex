"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getCatalogServicesApi, type CatalogService } from "@/lib/api-client/catalog";

export default function CatalogPage() {

  const [services,setServices] = useState<CatalogService[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    void load();
  },[]);


async function load(){

  try{

    const result = await getCatalogServicesApi();

    setServices(result.services ?? []);

  }catch(error){

    console.error(error);

    setServices([]);

  }finally{

    setLoading(false);

  }

}

  if(loading){
    return (
      <div className="p-6">
        در حال دریافت سرویس‌ها...
      </div>
    );
  }


  return (
    <div className="space-y-6 p-6">

      <div>
        <h1 className="text-2xl font-bold">
          کاتالوگ سرویس‌ها
        </h1>

        <p className="text-muted-foreground mt-2">
          سرویس‌های قابل فعال‌سازی برای کسب‌وکار شما
        </p>
      </div>


<div className="grid gap-4 md:grid-cols-3">

  {(services ?? []).map(service => (

    <Card
      key={service.id}
      className="p-5"
    >

      <h2 className="font-semibold">
        {service.name}
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        {service.description}
      </p>

      <ButtonLink
        href={`/services/${service.slug ?? service.id}`}
        className="mt-4"
      >
        مشاهده سرویس
      </ButtonLink>

    </Card>

  ))}

</div>

    </div>
  );
}
