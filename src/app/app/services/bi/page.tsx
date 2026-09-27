import { ArrowLeft, BarChart3, FileSpreadsheet, LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ServiceWorkspace } from "@/components/app/service-workspace";

export default function BIAppPage() {
  return (
    <ServiceWorkspace
      service="bi"
      title="داشبورد فروش"
      description="نمای مدیریتی فروش براساس داده‌های کسب‌وکار شما."
      stateDescription="برای ساخت داشبورد واقعی، ابتدا منبع داده و شاخص‌های کلیدی کسب‌وکار مشخص می‌شوند."
      modules={[]}
    >
      <Card className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-card border border-primary/15 bg-primary/10 text-primary"><BarChart3 size={22} /></div>
        <Badge className="mt-4">ماژول BI فروش</Badge>
        <h2 data-display-title="true" className="mt-4 text-xl font-bold">منبع داده‌ای برای این کسب‌وکار متصل نشده است</h2>
        <p className="mx-auto mt-2 max-w-xl font-ui text-sm leading-7 text-foreground-muted">پس از بررسی فایل‌های Excel، تعریف KPIها و راه‌اندازی منبع داده، داشبورد فروش از همین مسیر نمایش داده می‌شود.</p>
        <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
          <div className="rounded-control border border-border bg-background/40 p-4 text-right"><FileSpreadsheet size={17} className="text-primary" /><div className="mt-2 font-ui text-xs font-semibold">منبع فعلی: Excel</div></div>
          <div className="rounded-control border border-border bg-background/40 p-4 text-right"><LayoutDashboard size={17} className="text-primary" /><div className="mt-2 font-ui text-xs font-semibold">خروجی: داشبورد داخل Binix</div></div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3"><ButtonLink href="/services/bi-modules#bi-request" leadingIcon={<ArrowLeft size={15} />}>درخواست راه‌اندازی BI</ButtonLink><ButtonLink href="/app/services" variant="secondary">بازگشت به سرویس‌ها</ButtonLink></div>
      </Card>
    </ServiceWorkspace>
  );
}
