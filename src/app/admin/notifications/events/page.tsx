"use client";


import {
 useEffect,
 useState,
} from "react";


import {
 Plus,
 Trash2,
} from "lucide-react";


import {
 toast,
} from "sonner";


import {
 AdminPageHeader,
} from "@/components/admin/admin-page-header";


import {
 Button,
} from "@/components/ui/button";


import {
 Card,
} from "@/components/ui/card";


import {
 Badge,
} from "@/components/ui/badge";


import {
 getAdminNotificationEventsApi,
 createAdminNotificationEventApi,
 deleteAdminNotificationEventApi,
} from "@/lib/api-client/admin";




type EventItem={

 id:string;

 key:string;

 name:string;

 module:string;

 enabled:boolean;

};




export default function NotificationEventsPage(){


const [events,setEvents]=
useState<EventItem[]>([]);


const [open,setOpen]=
useState(false);


const [draft,setDraft]=
useState({

 key:"",
 name:"",
 module:"",
 enabled:true,

});




async function refresh(){

 try{

 const result =
 await getAdminNotificationEventsApi();


 setEvents(
  result.events
 );


 }catch(error){

 toast.error(
  error instanceof Error
  ? error.message
  : "خطا در دریافت رویدادها"
 );

 }


}



useEffect(()=>{

 void refresh();

},[]);





async function save(){


 if(
 !draft.key ||
 !draft.name ||
 !draft.module
 ){

 toast.error(
  "تمام فیلدها الزامی هستند"
 );

 return;

 }



 try{


 await createAdminNotificationEventApi(
  draft
 );


 toast.success(
  "رویداد اضافه شد"
 );


 setDraft({

 key:"",
 name:"",
 module:"",
 enabled:true,

 });


 setOpen(false);


 await refresh();



 }catch(error){

 toast.error(
  error instanceof Error
  ? error.message
  : "ذخیره نشد"
 );

 }


}





async function remove(id:string){


 try{


 await deleteAdminNotificationEventApi(id);


 toast.success(
  "رویداد حذف شد"
 );


 await refresh();



 }catch(error){

 toast.error(
  error instanceof Error
  ? error.message
  : "حذف نشد"
 );

 }


}





return (

<div className="space-y-6">


<AdminPageHeader

title="رویدادها"

description="مدیریت Event های اطلاع‌رسانی"

actions={

<Button
onClick={()=>setOpen(true)}
>

<Plus size={18}/>

افزودن رویداد

</Button>

}

/>



<Card>


<div className="divide-y">


{

events.map(item=>(


<div

key={item.id}

className="flex justify-between p-5"

>


<div>

<div className="font-bold">

{item.name}

</div>


<div className="text-sm">

{item.key} / {item.module}

</div>


</div>



<div className="flex gap-3 items-center">


<Badge>

{
item.enabled
?
"فعال"
:
"غیرفعال"
}

</Badge>



<Button

size="sm"

variant="danger"

onClick={()=>remove(item.id)}

>

<Trash2 size={15}/>

</Button>


</div>


</div>


))


}


</div>


</Card>




{

open &&

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">


<div data-admin-form-root className="bg-background p-6 rounded-xl w-full max-w-lg space-y-4">


<h2 className="font-bold">

افزودن رویداد

</h2>


<input

required

data-field-label="کلید رویداد"

className="w-full border rounded p-2"

placeholder="Key"

value={draft.key}

onChange={
e=>setDraft({
 ...draft,
 key:e.target.value
})
}

/>



<input

required

data-field-label="نام رویداد"

className="w-full border rounded p-2"

placeholder="نام"

value={draft.name}

onChange={
e=>setDraft({
 ...draft,
 name:e.target.value
})
}

/>



<input

required

data-field-label="ماژول رویداد"

className="w-full border rounded p-2"

placeholder="Module"

value={draft.module}

onChange={
e=>setDraft({
 ...draft,
 module:e.target.value
})
}

/>



<div className="flex gap-2">


<Button onClick={save}>

ذخیره

</Button>


<Button

variant="secondary"

onClick={()=>setOpen(false)}

>

لغو

</Button>


</div>


</div>


</div>


}



</div>

);


}
