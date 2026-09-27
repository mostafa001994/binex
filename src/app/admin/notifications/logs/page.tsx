"use client";

import {
 useEffect,
 useState,
} from "react";


import {
 toast,
} from "sonner";


import {
 getAdminNotificationLogsApi,
 type AdminNotificationLog,
} from "@/lib/api-client/admin";


import {
 AdminPageHeader,
} from "@/components/admin/admin-page-header";


import {
 Card,
} from "@/components/ui/card";


import {
 Badge,
} from "@/components/ui/badge";


import {
 AdminTableSkeleton,
} from "@/components/admin/admin-skeleton";



export default function AdminNotificationLogsPage(){


const [logs,setLogs] =
 useState<AdminNotificationLog[]>([]);


const [loading,setLoading] =
 useState(true);



async function load(){


try{

setLoading(true);


const result =
 await getAdminNotificationLogsApi();


setLogs(
 result.logs
);


}catch(error){


toast.error(
 "دریافت گزارش‌ها انجام نشد",
 {
  description:
   error instanceof Error
   ? error.message
   : undefined,
 }
);


}finally{

setLoading(false);

}


}



useEffect(()=>{

void load();

},[]);




return (

<div className="space-y-6">


<AdminPageHeader

title="گزارش ارسال‌ها"

description="تاریخچه پیام‌های ارسال شده توسط سیستم اطلاع‌رسانی"

/>



{

loading

?

<AdminTableSkeleton/>

:

<Card className="overflow-hidden">


<div className="divide-y divide-border">


{

logs.length===0

?

<div className="p-8 text-center text-foreground-muted">

هنوز پیامی ارسال نشده است

</div>


:

logs.map(log=>(


<div

key={log.id}

className="
p-5 space-y-3
"


>


<div className="flex items-center justify-between gap-4">


<div className="font-bold">

{log.eventKey}

</div>



<Badge>

{log.status}

</Badge>


</div>



<div className="grid gap-2 text-sm text-foreground-muted md:grid-cols-3">


<div>

کانال:
{log.channel}

</div>


<div>

گیرنده:
{log.receiver}

</div>


<div>

زمان:
{new Date(log.createdAt).toLocaleString("fa-IR")}

</div>


</div>



<div className="rounded-control bg-surface-muted p-3 text-sm">

{log.message}

</div>


</div>


))


}


</div>


</Card>

}


</div>

);

}
