import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ServiceIcon,
  ServiceTheme,
} from "@/components/theme/service-theme";
import {
  serviceById,
  type ServiceId,
} from "@/constants/services-config";

type ServiceState =
  | "setup"
  | "active"
  | "paused"
  | "coming-soon"
  | "not-enabled"
  | "awaiting-activation"
  | "setup-required"
  | "provisioning"
  | "ready"
  | "payment-required"
  | "setup-failed"
  | "ended";

interface ServiceShellHeaderProps {
  service: ServiceId;
  description?: string;
  status?: ServiceState;
  actions?: ReactNode;
}

export function ServiceShellHeader({
  service,
  description,
  status = "active",
  actions,
}: ServiceShellHeaderProps) {
  const config = serviceById[service];

  return (
    <ServiceTheme service={service}>
      <div className="relative overflow-hidden rounded-card border border-service-accent/20 bg-surface p-5 shadow-binix-sm sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-service-accent/[0.07] blur-[55px]" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-control border border-service-accent/20 bg-service-accent/10 text-service-accent">
              <ServiceIcon service={service} size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  data-display-title="true"
                  className="text-xl font-bold text-foreground"
                >
                  {config.name}
                </h2>
                <StateBadge status={status} />
              </div>

              <p className="mt-1.5 max-w-3xl font-ui text-sm leading-7 text-foreground-muted">
                {description ?? config.description}
              </p>
            </div>
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </ServiceTheme>
  );
}

function StateBadge({ status }: { status: ServiceState }) {
  if (status === "active" || status === "ready") return <Badge variant="success">آماده استفاده</Badge>;
  if (status === "setup" || status === "setup-required") return <Badge variant="warning">نیازمند راه‌اندازی</Badge>;
  if (status === "awaiting-activation") return <Badge variant="warning">در انتظار فعال‌سازی</Badge>;
  if (status === "provisioning") return <Badge variant="warning">در حال راه‌اندازی</Badge>;
  if (status === "payment-required") return <Badge variant="error">نیازمند پرداخت</Badge>;
  if (status === "setup-failed") return <Badge variant="error">خطا در راه‌اندازی</Badge>;
  if (status === "paused") return <Badge variant="error">متوقف</Badge>;
  if (status === "ended") return <Badge>پایان‌یافته</Badge>;
  if (status === "coming-soon") return <Badge>به‌زودی</Badge>;
  return <Badge>فعال نشده</Badge>;
}
