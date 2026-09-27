"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, LockKeyhole, RefreshCw, Sparkles } from "lucide-react";
import { AppPage } from "@/components/app/app-page";
import { AppSection } from "@/components/app/app-section";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCustomerCustomServicesApi, type CustomOffer, type CustomSubscription } from "@/lib/api-client/custom-services";

type Snapshot = Awaited<ReturnType<typeof getCustomerCustomServicesApi>>;
function money(amount: string) { try { return `${(BigInt(amount) / 10n).toLocaleString("fa-IR")} تومان`; } catch { return "—"; } }
function date(value: string) { return new Date(value).toLocaleDateString("fa-IR-u-ca-persian", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Tehran" }); }

export default function CustomServicesPage() {
  const [data, setData] = useState<Snapshot | null>(null); const [error, setError] = useState("");
  const load = useCallback(async () => { setError(""); try { setData(await getCustomerCustomServicesApi()); } catch (reason) { setError(reason instanceof Error ? reason.message : "دریافت اطلاعات انجام نشد."); } }, []);
  useEffect(() => { void load(); }, [load]);
  return <AppPage width="wide">
    <PageHeader title="سرویس‌های اختصاصی" description="پیشنهادهای ویژه این کسب‌وکار و سرویس‌هایی که فقط برای شما فعال شده‌اند."/>
    {error ? <Card className="text-center"><p className="font-ui text-sm text-error">{error}</p><Button className="mt-4" variant="secondary" leadingIcon={<RefreshCw size={15}/>} onClick={() => void load()}>تلاش دوباره</Button></Card> : !data ? <div className="h-52 animate-pulse rounded-card bg-surface-raised"/> : <>
      {data.access.canPay && <AppSection title="پیشنهادهای قابل پرداخت" description="جزئیات هر پیشنهاد را بررسی کنید و فقط در صورت تأیید پرداخت را انجام دهید.">
        {data.offers.filter((item) => item.status === "SENT" || item.status === "PAYMENT_PENDING").length ? <div className="grid gap-4 xl:grid-cols-2">{data.offers.filter((item) => item.status === "SENT" || item.status === "PAYMENT_PENDING").map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div> : <Card className="font-ui text-sm text-foreground-muted">پیشنهاد فعالی برای پرداخت ندارید.</Card>}
      </AppSection>}
      {!data.access.canPay && <Card className="flex items-center gap-3"><LockKeyhole size={20} className="text-primary"/><p className="font-ui text-sm text-foreground-muted">پیشنهادهای مالی فقط برای مالک کسب‌وکار نمایش داده می‌شوند؛ سرویس فعال برای اعضای مجاز قابل مشاهده است.</p></Card>}
      <AppSection title="اشتراک‌های اختصاصی فعال" description="این سرویس‌ها مستقل از سرویس‌ها و اشتراک‌های عمومی Binix هستند.">
        {data.subscriptions.length ? <div className="grid gap-4 xl:grid-cols-2">{data.subscriptions.map((item) => <SubscriptionCard key={item.id} item={item}/>)}</div> : <Card className="text-center font-ui text-sm text-foreground-muted">هنوز سرویس اختصاصی فعالی برای این کسب‌وکار وجود ندارد.</Card>}
      </AppSection>
      {data.access.canPay && data.offers.some((item) => ["PAID", "EXPIRED", "CANCELED"].includes(item.status)) && <AppSection title="تاریخچه پیشنهادها" description="پیشنهادهای پرداخت‌شده، منقضی یا لغوشده."><div className="grid gap-4 xl:grid-cols-2">{data.offers.filter((item) => ["PAID", "EXPIRED", "CANCELED"].includes(item.status)).map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div></AppSection>}
    </>}
  </AppPage>;
}

function OfferCard({ offer }: { offer: CustomOffer }) {
  const payable = offer.status === "SENT" || offer.status === "PAYMENT_PENDING";
  const status = offer.status === "PAID" ? "پرداخت‌شده" : offer.status === "EXPIRED" ? "منقضی" : offer.status === "CANCELED" ? "لغوشده" : offer.status === "PAYMENT_PENDING" ? "در انتظار پرداخت" : "پیشنهاد جدید";
  return <Card className="flex h-full flex-col"><div className="flex items-start justify-between gap-3"><div><p className="font-ui text-xs text-primary">{offer.customService.name}</p><h2 className="mt-1 text-xl font-bold">{offer.title}</h2></div><Badge variant={offer.status === "PAID" ? "success" : payable ? "warning" : "default"}>{status}</Badge></div><p className="mt-3 font-ui text-sm leading-7 text-foreground-muted">{offer.description}</p><div className="mt-4 grid grid-cols-2 gap-2 font-ui text-xs"><div className="rounded-control bg-surface-raised p-3">{money(offer.priceAmount)}</div><div className="rounded-control bg-surface-raised p-3">مهلت تا {date(offer.validUntil)}</div></div>{payable && <ButtonLink href={`/app/custom-services/${offer.id}`} className="mt-4">مشاهده جزئیات و پرداخت</ButtonLink>}{offer.status === "PAID" && offer.subscription && <p className="mt-4 rounded-control bg-success/10 p-3 font-ui text-xs text-success">اشتراک تا {date(offer.subscription.endsAt)} ثبت شده است.</p>}</Card>;
}
function SubscriptionCard({ item }: { item: CustomSubscription }) {
  return <Card className="flex h-full flex-col"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="flex size-10 items-center justify-center rounded-control bg-primary/10 text-primary"><Sparkles size={18}/></span><div><p className="font-ui text-xs text-foreground-subtle">{item.offerTitleSnapshot}</p><h2 className="mt-1 text-lg font-bold">{item.serviceNameSnapshot}</h2></div></div><Badge variant={item.status === "ACTIVE" ? "success" : "default"}>{item.status === "ACTIVE" ? "فعال" : item.status === "PAUSED" ? "متوقف" : "پایان‌یافته"}</Badge></div><p className="mt-4 font-ui text-sm leading-7 text-foreground-muted">{item.descriptionSnapshot}</p><div className="mt-4 flex flex-wrap gap-2 font-ui text-xs text-foreground-muted"><span className="flex items-center gap-1 rounded-control bg-surface-raised px-3 py-2"><CheckCircle2 size={14}/> {money(item.priceAmount)}</span><span className="flex items-center gap-1 rounded-control bg-surface-raised px-3 py-2"><CalendarDays size={14}/> تا {date(item.endsAt)}</span></div>{item.customService.appHref && item.status === "ACTIVE" ? <ButtonLink href={item.customService.appHref} className="mt-4">ورود به سرویس</ButtonLink> : null}</Card>;
}
