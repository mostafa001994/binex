"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Layers3,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import { iconRegistry } from "@/constants/icon-registry";

import { AppPage } from "@/components/app/app-page";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import {
  getServicesApi,
  type ServiceApiAccess,
  type ServiceApiItem,
} from "@/lib/api-client/services";


type Snapshot = {
  services: ServiceApiItem[];
  access: ServiceApiAccess;
};



export default function ServicesPage() {


  const [
    snapshot,
    setSnapshot,
  ] = useState<Snapshot | null>(null);



  const [
    error,
    setError,
  ] = useState("");



  const load = useCallback(async () => {

    setError("");
    setSnapshot(null);


    try {

      const servicesSnapshot =
        await getServicesApi();


      setSnapshot({

        services:
          servicesSnapshot.services,

        access:
          servicesSnapshot.access,

      });


    } catch (reason) {


      setError(
        reason instanceof Error
          ? reason.message
          : "سرویس‌ها قابل دریافت نیستند.",
      );


    }


  }, []);




  useEffect(() => {

    void load();

  }, [load]);




  if (error) {

    return (

      <AppPage>

        <Card className="text-center">

          <Layers3
            size={22}
            className="mx-auto text-error"
          />


          <h1
            data-display-title="true"
            className="mt-4 text-xl font-bold"
          >
            دریافت سرویس‌ها انجام نشد
          </h1>


          <p className="mt-2 text-sm text-foreground-muted">

            {error}

          </p>


          <Button

            className="mt-5"

            variant="secondary"

            leadingIcon={
              <RefreshCw size={15}/>
            }

            onClick={() => void load()}

          >

            تلاش دوباره

          </Button>


        </Card>


      </AppPage>

    );

  }




  if (!snapshot) {

    return (

      <AppPage>

        <Card className="text-center">

          در حال دریافت سرویس‌ها...

        </Card>

      </AppPage>

    );

  }



  const services =
    snapshot.services;



  return (

    <AppPage>


      <PageHeader

        title="سرویس‌های من"

        description="سرویس‌های فعال کسب‌وکار شما"

      />
      <div className="space-y-6">


        {
          services.length === 0 && (

            <Card className="text-center">

              <div className="text-sm text-foreground-muted">

                هنوز سرویسی برای این کسب‌وکار فعال نشده است.

              </div>

            </Card>

          )
        }



        {
          services.map(service => (


            <Card

              key={service.id}

              className="overflow-hidden"

            >


              <div className="flex items-start justify-between">


                <div className="flex gap-3">


                  <div className="rounded-lg bg-muted p-3">

                    {
                      (() => {

                        const ServiceIcon =
                          iconRegistry[
                            service.iconKey
                          ] ?? ShoppingBag;


                        return (

                          <ServiceIcon size={22}/>

                        );

                      })()
                    }

                  </div>



                  <div>


                    <h2 className="font-bold">

                      {service.name}

                    </h2>



                    <p className="text-sm text-foreground-muted">

                      {service.description}

                    </p>


                  </div>


                </div>



                {
                  service.status && (

                    <Badge>

                      فعال

                    </Badge>

                  )
                }


              </div>



              <div className="mt-5">


                {
                  service.journey && (

                    <div className="rounded-xl border p-4">


                      <div className="font-semibold">

                        {service.journey.label}

                      </div>


                      <p className="mt-1 text-sm text-foreground-muted">

                        {service.journey.description}

                      </p>



                      {
                        service.journey.nextAction.href && (




<ButtonLink
  href={service.journey.nextAction.href ?? "/app/services"}
  className="mt-4"
>
  {service.journey.nextAction.label}
</ButtonLink>

                        )
                      }


                    </div>

                  )
                }


              </div>


            </Card>


          ))
        }


      </div>
    </AppPage>

  );

}
