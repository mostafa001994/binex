"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
import { getOperationalAlertsApi,type OperationalAlert } from "@/lib/api-client/support";
export default function AdminAlertsPage(){const[items,setItems]=useState<OperationalAlert[]>([]);useEffect(()=>{getOperationalAlertsApi().then(data=>setItems(data.items)).catch(e=>toast.error(e instanceof Error?e.message:"دریافت هشدارها ناموفق بود"))},[]);return <div className="mx-auto w-full max-w-[1480px] space-y-6 px-4 py-8 md:px-6"><AdminPageHeader title="هشدارهای عملیاتی" description="موارد واقعی استخراج‌شده از پرداخت، اشتراک، راه‌اندازی و پشتیبانی."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{items.map(item=><Link key={item.key} href={item.href}><Card className={item.count?"border-warning/40":""}><BellRing size={18} className={item.count?"text-warning":"text-success"}/><div className="mt-4 text-3xl font-bold">{item.count.toLocaleString("fa-IR")}</div><p className="mt-2 text-sm text-foreground-muted">{item.title}</p></Card></Link>)}</div></div>}
