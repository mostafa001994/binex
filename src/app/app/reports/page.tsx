"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BarChart3, FileSpreadsheet, RefreshCw } from "lucide-react";
import { AppPage } from "@/components/app/app-page";
import { PageHeader } from "@/components/shell/page-header";
import { ProductStatusBanner } from "@/components/binix/product-status-banner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { iconRegistry } from "@/constants/icon-registry";
import { getServicesApi, type ServiceApiItem } from "@/lib/api-client/services";

export default function ReportsPage() {
  const [services, setServices] = useState<ServiceApiItem[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    setServices(null);
    getServicesApi()
      .then((data) => setServices(data.services.filter((service) => service.businessServiceId !== null)))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "وضعیت منابع گزارش قابل دریافت نیست."));
  }, []);

  useEffect(() => load(), [load]);

  return (
    <AppPage width="wide">
      <PageHeader
        title="گزارش‌ها"
        description="مرکز دسترسی به گزارش‌های واقعی سرویس‌های همین کسب‌وکار."
        actions={<ButtonLink href="/app/services" variant="secondary" leadingIcon={<FileSpreadsheet size={15} />}>مشاهده سرویس‌ها</ButtonLink>}
      />

      <ProductStatusBanner
        tone="warning"
        title="خروجی گزارش هنوز به جریان‌های n8n متصل نشده است"
        description="تا زمان تعریف قرارداد اتصال هر سرویس، این صفحه فقط آمادگی منبع را نشان می‌دهد و هیچ KPI یا گزارش ساختگی تولید نمی‌کند."
      />

      {services === null && !error ? <ReportsSkeleton /> : error ? (
        <Card className="text-center">
          <BarChart3 size={22} className="mx-auto text-error" />
          <h2 data-display-title="true" className="mt-4 text-lg font-bold">منابع گزارش دریافت نشدند</h2>
          <p className="mt-2 font-ui text-sm text-foreground-muted">{error}</p>
          <Button className="mt-5" variant="secondary" leadingIcon={<RefreshCw size={15} />} onClick={load}>تلاش دوباره</Button>
        </Card>
      ) : services && services.length > 0 ? (
        <section>
          <div className="mb-4">
            <h2 data-display-title="true" className="text-xl font-bold">منابع گزارش کسب‌وکار</h2>
            <p className="mt-1 font-ui text-sm text-foreground-muted">برای تولید گزارش، سرویس باید آماده و قرارداد داده آن متصل باشد.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => <ReportSourceCard key={service.id} service={service} />)}
          </div>
        </section>
      ) : (
        <Card className="py-16 text-center">
          <BarChart3 size={24} className="mx-auto text-primary" />
          <h2 data-display-title="true" className="mt-4 text-lg font-bold">هنوز منبع گزارشی ندارید</h2>
          <p className="mt-2 font-ui text-sm text-foreground-muted">پس از فعال‌سازی یک سرویس، وضعیت منبع داده آن در این بخش نمایش داده می‌شود.</p>
          <ButtonLink className="mt-5" href="/app/services" leadingIcon={<ArrowLeft size={15} />}>مشاهده سرویس‌ها</ButtonLink>
        </Card>
      )}
    </AppPage>
  );
}

function ReportSourceCard({ service }: { service: ServiceApiItem }) {
  const Icon = iconRegistry[service.iconKey] ?? iconRegistry["layout-grid"];
  const isReady = service.journey.status === "ready";
  const actionHref = service.journey.nextAction.href ?? service.appHref ?? `/app/services/${service.id}`;

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-control" style={{ color: service.accent, background: `color-mix(in srgb, ${service.accent} 10%, transparent)` }}>
          <Icon size={18} />
        </div>
        <Badge variant={isReady ? "info" : "warning"}>{isReady ? "در انتظار اتصال داده" : service.journey.label}</Badge>
      </div>
      <h3 data-display-title="true" className="mt-4 text-lg font-bold">{service.shortName}</h3>
      <p className="mt-2 font-ui text-sm leading-7 text-foreground-muted">
        {isReady ? "خود سرویس آماده است؛ نمایش گزارش پس از اتصال خروجی واقعی آن فعال می‌شود." : service.journey.description}
      </p>
      <div className="mt-auto border-t border-border-subtle pt-4">
        <ButtonLink href={actionHref} variant="secondary" className="w-full">{isReady ? "رفتن به سرویس" : service.journey.nextAction.label}</ButtonLink>
      </div>
    </Card>
  );
}

function ReportsSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-card bg-surface-raised" />)}</div>;
}
