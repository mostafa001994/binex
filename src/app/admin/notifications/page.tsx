"use client";

import Link from "next/link";

import {
 Bell,
 FileText,
 Radio,
 BarChart3,
} from "lucide-react";


import {
 AdminPageHeader,
} from "@/components/admin/admin-page-header";


import {
 Card,
} from "@/components/ui/card";



const items = [

 {
  title:"سرویس‌دهنده‌ها",
  description:
   "مدیریت پنل‌های پیامکی، ایمیل و سایر Provider ها",
  href:"/admin/notifications/providers",
  icon:Radio,
 },


 {
  title:"قالب‌های پیام",
  description:
   "ویرایش متن پیام‌های سیستم",
  href:"/admin/notifications/templates",
  icon:FileText,
 },


 {
  title:"رویدادها",
  description:
   "مدیریت Event های اطلاع‌رسانی",
  href:"/admin/notifications/events",
  icon:Bell,
 },


 {
  title:"گزارش ارسال‌ها",
  description:
   "مشاهده تاریخچه پیام‌های ارسال شده",
  href:"/admin/notifications/logs",
  icon:BarChart3,
 },


];



export default function AdminNotificationsPage(){


return (

<div className="space-y-6">


<AdminPageHeader

title="مرکز اطلاع‌رسانی"

description="مدیریت پیام‌ها، Provider ها و رویدادهای سیستم"

/>



<div className="grid gap-4 md:grid-cols-2">


{

items.map(item=>{

const Icon=item.icon;


return (

<Link
key={item.href}
href={item.href}
>


<Card
className="
p-6 transition
hover:bg-surface-hover
"
>


<div className="flex items-start gap-4">


<div
className="
flex size-12 items-center
justify-center rounded-card
bg-primary/10 text-primary
"
>

<Icon size={24}/>

</div>



<div>

<h3 className="font-bold">

{item.title}

</h3>


<p className="mt-2 text-sm text-foreground-muted">

{item.description}

</p>


</div>


</div>


</Card>


</Link>

)

})

}


</div>


</div>

);

}
