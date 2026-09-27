import { ArrowLeft, Clock3 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { iconRegistry, type IconKey } from "@/constants/icon-registry";
import { cn } from "@/lib/cn";

export type ServiceModuleStatus = "ready" | "setup" | "coming-soon";

export function ServiceModuleCard({
  icon,
  title,
  description,
  status = "ready",
  href,
}: {
  icon: IconKey;
  title: string;
  description: string;
  status?: ServiceModuleStatus;
  href?: string;
}) {
  const Icon = iconRegistry[icon];
  const statusLabel = {
    ready: <Badge variant="success">آماده</Badge>,
    setup: <Badge variant="warning">نیازمند راه‌اندازی</Badge>,
    "coming-soon": <Badge>به‌زودی</Badge>,
  }[status];

  const content = (
    <Card className={cn("group flex h-full flex-col transition duration-200", href && "hover:-translate-y-px hover:border-border-strong hover:bg-surface-muted")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-control border border-primary/15 bg-primary/10 text-primary"><Icon size={18} aria-hidden="true" /></div>
        {statusLabel}
      </div>
      <h3 data-display-title="true" className="mt-5 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 flex-1 font-ui text-sm leading-7 text-foreground-muted">{description}</p>
      <div className="mt-5 flex items-center gap-1.5 font-ui text-xs font-medium text-foreground-subtle">
        {href ? <><span>مشاهده بخش</span><ArrowLeft size={14} className="transition group-hover:-translate-x-1" aria-hidden="true" /></> : <><Clock3 size={14} aria-hidden="true" /><span>{status === "coming-soon" ? "در نسخه بعدی" : "بعد از تکمیل راه‌اندازی"}</span></>}
      </div>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
