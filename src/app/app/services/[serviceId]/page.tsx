"use client";

import {
  use,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  Check,
  LockKeyhole,
  PauseCircle,
} from "lucide-react";
import { AppPage } from "@/components/app/app-page";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  getServiceApi,
  type ServiceApiItem,
} from "@/lib/api-client/services";
import { iconRegistry } from "@/constants/icon-registry";

export default function GenericServiceWorkspacePage({
  params,
}: {
  params: Promise<{
    serviceId: string;
  }>;
}) {
  const { serviceId } =
    use(params);
  const [
    service,
    setService,
  ] =
    useState<ServiceApiItem | null>(
      null,
    );
  const [error, setError] =
    useState("");

  useEffect(() => {
    getServiceApi(serviceId)
      .then((result) =>
        setService(
          result.service,
        ),
      )
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "سرویس قابل دریافت نیست.",
        ),
      );
  }, [serviceId]);

  if (error) {
    return (
      <AppPage>
        <Card className="text-center">
          <h1
            data-display-title="true"
            className="text-xl font-bold"
          >
            سرویس در دسترس نیست
          </h1>
          <p className="mt-2 font-ui text-sm text-foreground-muted">
            {error}
          </p>
        </Card>
      </AppPage>
    );
  }

  if (!service) {
    return (
      <AppPage>
        <div className="h-72 animate-pulse rounded-card bg-surface-raised" />
      </AppPage>
    );
  }

  const Icon =
    iconRegistry[
      service.iconKey
    ] ??
    iconRegistry[
      "layout-grid"
    ];

  const blocked = ![
    "ready",
    "setup-required",
  ].includes(service.journey.status);

  return (
    <AppPage>
      <PageHeader
        title={service.name}
        description={
          service.description
        }
        breadcrumbs={[
          {
            label: "خانه",
            href: "/app",
          },
          {
            label:
              "سرویس‌ها",
            href: "/app/services",
          },
          {
            label:
              service.shortName,
          },
        ]}
      />

      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-card border"
              style={{
                color:
                  service.accent,
                borderColor:
                  `color-mix(in srgb, ${service.accent} 24%, transparent)`,
                background:
                  `color-mix(in srgb, ${service.accent} 9%, transparent)`,
              }}
            >
              <Icon size={21} />
            </div>

            <div>
              <div className="font-ui text-xs text-foreground-subtle">
                {service.category}
              </div>
              <h2
                data-display-title="true"
                className="mt-1 text-xl font-bold"
              >
                فضای مدیریت سرویس
              </h2>
            </div>
          </div>

          <ServiceStateBadge
            status={service.journey.status}
            label={service.journey.label}
          />
        </div>

        {blocked ? (
          <div className="mt-6 rounded-card border border-border-subtle bg-surface-raised/50 p-5 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-card border border-border text-foreground-muted">
              {service.journey.status === "paused" ? (
                <PauseCircle
                  size={20}
                />
              ) : (
                <LockKeyhole
                  size={19}
                />
              )}
            </div>

            <h3
              data-display-title="true"
              className="mt-4 text-lg font-bold"
            >
              {service.journey.label}
            </h3>

            <p className="mx-auto mt-2 max-w-xl font-ui text-sm leading-7 text-foreground-muted">
              {service.journey.description}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {service.journey.nextAction.href ? (
                <ButtonLink href={service.journey.nextAction.href} leadingIcon={<ArrowLeft size={14} />}>
                  {service.journey.nextAction.label}
                </ButtonLink>
              ) : null}
              <ButtonLink href="/app/services" variant="secondary">بازگشت به سرویس‌ها</ButtonLink>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="font-ui text-sm leading-7 text-foreground-muted">
              این فضای عمومی برای سرویس‌هایی است که هنوز رابط اختصاصی ندارند. قابلیت‌های ثبت‌شده سرویس بدون ساخت داده یا شاخص غیرواقعی نمایش داده می‌شوند.
            </p>

            {service.features
              .length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {service.features.map(
                  (feature) => (
                    <div
                      key={
                        feature
                      }
                      className="font-ui flex items-center gap-2 rounded-control border border-border-subtle bg-surface-raised/40 px-3 py-3 text-sm text-foreground-muted"
                    >
                      <Check
                        size={14}
                        style={{
                          color:
                            service.accent,
                        }}
                      />
                      {feature}
                    </div>
                  ),
                )}
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </AppPage>
  );
}

function ServiceStateBadge({
  status,
  label,
}: {
  status: ServiceApiItem["journey"]["status"];
  label: string;
}) {
  if (status === "ready") {
    return (
      <Badge variant="success">
        {label}
      </Badge>
    );
  }

  if (["setup-required", "awaiting-activation", "provisioning"].includes(status)) {
    return (
      <Badge variant="warning">
        {label}
      </Badge>
    );
  }

  if (["paused", "payment-required", "setup-failed"].includes(status)) {
    return (
      <Badge variant="error">
        {label}
      </Badge>
    );
  }
  return <Badge>{label}</Badge>;
}
