import { ArrowLeft, Clock3 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ServiceIcon, ServiceTheme } from "@/components/theme/service-theme";
import { serviceById, type ServiceId } from "@/constants/services-config";

interface ServiceCardProps {
  service: ServiceId;
  status?: "active" | "available" | "coming-soon";
  href?: string;
  actionLabel?: string;
}

export function ServiceCard({
  service,
  status = "available",
  href,
  actionLabel,
}: ServiceCardProps) {
  const config = serviceById[service];
  const resolvedHref = href ?? config.appHref ?? config.href;

  const statusMap = {
    active: <Badge variant="success">فعال</Badge>,
    available: <Badge variant="ai">قابل فعال‌سازی</Badge>,
    "coming-soon": <Badge>به‌زودی</Badge>,
  };

  return (
    <ServiceTheme service={service} className="h-full">
      <Link href={resolvedHref} className="block h-full">
        <Card className="group flex h-full flex-col gap-5 transition duration-200 hover:-translate-y-px hover:border-service-accent/30 hover:bg-surface-muted">
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-11 items-center justify-center rounded-control border border-service-accent/20 bg-service-accent/10 text-service-accent">
              {status === "coming-soon" ? (
                <Clock3 size={21} />
              ) : (
                <ServiceIcon service={service} size={21} />
              )}
            </div>
            {statusMap[status]}
          </div>

          <div className="space-y-2">
            <p className="font-ui text-xs font-medium text-foreground-subtle">
              {config.category}
            </p>
            <h3 data-display-title="true" className="text-xl font-bold text-foreground">
              {config.name}
            </h3>
            <p className="font-ui text-sm leading-7 text-foreground-muted">
              {config.description}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-1.5 pt-1 font-ui text-sm font-medium text-service-accent">
            <span>
              {actionLabel ??
                (status === "active"
                  ? "مدیریت سرویس"
                  : status === "coming-soon"
                    ? "مشاهده وضعیت"
                    : "مشاهده سرویس")}
            </span>
            <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
          </div>
        </Card>
      </Link>
    </ServiceTheme>
  );
}
