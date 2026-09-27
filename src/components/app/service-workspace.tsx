"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, LockKeyhole, PauseCircle, RefreshCw } from "lucide-react";
import { AppPage } from "@/components/app/app-page";
import { AppSection } from "@/components/app/app-section";
import { ServiceModuleCard, type ServiceModuleStatus } from "@/components/app/service-module-card";
import { ServiceShellHeader } from "@/components/binix/service-shell-header";
import { PageHeader } from "@/components/shell/page-header";
import { serviceById, type ServiceId } from "@/constants/services-config";
import type { IconKey } from "@/constants/icon-registry";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { getServiceApi, type ServiceApiAccess, type ServiceApiItem } from "@/lib/api-client/services";

export type WorkspaceModule = {
  icon: IconKey;
  title: string;
  description: string;
  status?: ServiceModuleStatus;
  href?: string;
};

export function ServiceWorkspace({
  service,
  title,
  description,
  stateDescription,
  modules,
  children,
}: {
  service: ServiceId;
  title?: string;
  description: string;
  stateDescription?: string;
  modules: WorkspaceModule[];
  children?: ReactNode;
}) {
  const config = serviceById[service];
  const [snapshot, setSnapshot] = useState<{ service: ServiceApiItem; access: ServiceApiAccess } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    setSnapshot(null);
    getServiceApi(service)
      .then(setSnapshot)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "وضعیت سرویس قابل دریافت نیست."));
  }, [service]);

  useEffect(() => load(), [load]);

  if (error) {
    return (
      <AppPage>
        <PageHeader title={title ?? config.name} description={description} breadcrumbs={[{ label: "خانه", href: "/app" }, { label: "سرویس‌ها", href: "/app/services" }, { label: config.shortName }]} />
        <Card className="text-center">
          <AlertTriangle size={22} className="mx-auto text-error" />
          <h2 data-display-title="true" className="mt-4 text-xl font-bold">وضعیت سرویس دریافت نشد</h2>
          <p className="mt-2 font-ui text-sm text-foreground-muted">{error}</p>
          <Button className="mt-5" variant="secondary" leadingIcon={<RefreshCw size={15} />} onClick={load}>تلاش دوباره</Button>
        </Card>
      </AppPage>
    );
  }

  if (!snapshot) {
    return (
      <AppPage>
        <div className="h-24 animate-pulse rounded-card bg-surface-raised" />
        <div className="h-56 animate-pulse rounded-card bg-surface-raised" />
      </AppPage>
    );
  }

  const journey = snapshot.service.journey;
  const blocked = !["ready", "setup-required"].includes(journey.status);

  return (
    <AppPage>
      <PageHeader
        title={title ?? config.name}
        description={description}
        breadcrumbs={[{ label: "خانه", href: "/app" }, { label: "سرویس‌ها", href: "/app/services" }, { label: config.shortName }]}
      />

      <ServiceShellHeader
        service={service}
        description={stateDescription ?? journey.description}
        status={journey.status}
      />

      {blocked ? (
        <BlockedServiceState service={snapshot.service} canManageBilling={snapshot.access.canManageBilling} />
      ) : (
        <>
          {journey.status === "setup-required" && (
            <div className="rounded-card border border-warning/20 bg-warning/[0.07] p-4" role="status">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <div className="font-display text-sm font-bold text-foreground">تنظیمات اولیه را تکمیل کنید</div>
                  <p className="mt-1 font-ui text-xs leading-6 text-foreground-muted">{journey.description}</p>
                </div>
              </div>
            </div>
          )}

          <AppSection title="مرکز مدیریت سرویس" description="ابزارهای اصلی این سرویس در یک ساختار مشترک و قابل توسعه در دسترس هستند.">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {modules.map((module) => <ServiceModuleCard key={module.title} {...module} />)}
            </div>
          </AppSection>
          {children}
        </>
      )}
    </AppPage>
  );
}

function BlockedServiceState({ service, canManageBilling }: { service: ServiceApiItem; canManageBilling: boolean }) {
  const journey = service.journey;
  const action = journey.nextAction;
  const isPaused = journey.status === "paused";
  const isFailure = journey.status === "setup-failed" || journey.status === "payment-required";

  return (
    <Card className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-card border border-border bg-surface-raised text-foreground-muted">
        {isPaused ? <PauseCircle size={22} /> : isFailure ? <AlertTriangle size={21} /> : <LockKeyhole size={21} />}
      </div>
      <Badge className="mt-4" variant={isFailure || isPaused ? "error" : "warning"}>{journey.label}</Badge>
      <h2 data-display-title="true" className="mt-4 text-xl font-bold">دسترسی به فضای سرویس محدود است</h2>
      <p className="mx-auto mt-2 max-w-xl font-ui text-sm leading-7 text-foreground-muted">{journey.description}</p>
      {!canManageBilling && journey.status === "not-enabled" && (
        <p className="mx-auto mt-2 max-w-xl font-ui text-xs leading-6 text-foreground-subtle">فعال‌سازی و خرید سرویس فقط توسط مالک کسب‌وکار انجام می‌شود.</p>
      )}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {action.href ? <ButtonLink href={action.href}>{action.label}</ButtonLink> : null}
        <ButtonLink href="/app/services" variant="secondary">بازگشت به سرویس‌ها</ButtonLink>
      </div>
    </Card>
  );
}
