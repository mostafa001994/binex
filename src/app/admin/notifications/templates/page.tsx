"use client";

import {
 useEffect,
 useState,
} from "react";

import {
 Plus,
 Pencil,
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
 Modal,
} from "@/components/ui/modal";


import {
 getAdminNotificationTemplatesApi,
 createAdminNotificationTemplateApi,
 updateAdminNotificationTemplateApi,
 deleteAdminNotificationTemplateApi,
 getAdminNotificationEventsApi,
 type AdminNotificationTemplate,
 type AdminNotificationEvent,
} from "@/lib/api-client/admin";


type Draft={

 eventKey:string;

 channel:string;

 title:string;

 body:string;

 variables:string;

 enabled:boolean;

};



const emptyDraft:Draft={

 eventKey:"",

 channel:"",

 title:"",

 body:"",

 variables:"[]",

 enabled:true,

};




export default function NotificationTemplatesPage(){


const [templates,setTemplates]=
 useState<AdminNotificationTemplate[]>([]);

const [events,setEvents]=
 useState<AdminNotificationEvent[]>([]);

const [loading,setLoading]=
 useState(true);


const [open,setOpen]=
 useState(false);


const [editing,setEditing]=
 useState<AdminNotificationTemplate|null>(null);


const [saving,setSaving]=
 useState(false);


const [draft,setDraft]=
 useState<Draft>(emptyDraft);





async function refresh(){

 try{

 setLoading(true);

 const result =
  await getAdminNotificationTemplatesApi();


 setTemplates(
  result.templates
 );


const eventResult =
 await getAdminNotificationEventsApi();


setEvents(
 eventResult.events ?? []
);



 }catch(error){

 toast.error(
  error instanceof Error
  ? error.message
  : "خطا در دریافت قالب‌ها"
 );


 }finally{

 setLoading(false);

 }

}




useEffect(()=>{

 void refresh();

},[]);





function openCreate(){

 setEditing(null);

setDraft({
 ...emptyDraft,
 variables:"[]",
});

 setOpen(true);

}




function openEdit(
 item:AdminNotificationTemplate
){

 setEditing(item);


 setDraft({

  eventKey:item.eventKey,

  channel:item.channel,

  title:item.title ?? "",

  body:item.body,

  variables:
   JSON.stringify(
    item.variables ?? [],
    null,
    2
   ),

  enabled:item.enabled,

 });


 setOpen(true);

}





async function save(){


 if(!draft.eventKey.trim()){

 toast.error(
  "Event Key الزامی است"
 );

 return;

 }


 if(!draft.channel.trim()){

 toast.error(
  "Channel الزامی است"
 );

 return;

 }


 if(!draft.body.trim()){

 toast.error(
  "متن پیام الزامی است"
 );

 return;

 }



 setSaving(true);


 try{


 const payload={

  eventKey:draft.eventKey.trim(),

  channel:draft.channel.trim(),

  title:draft.title.trim() || null,

  body:draft.body.trim(),

  variables:
   JSON.parse(
    draft.variables || "[]"
   ),

  enabled:draft.enabled,

 };




 if(editing){


 await updateAdminNotificationTemplateApi(
  editing.id,
  payload,
 );


 toast.success(
  "قالب بروزرسانی شد"
 );


 }else{


 await createAdminNotificationTemplateApi(
  payload,
 );


 toast.success(
  "قالب اضافه شد"
 );


 }



 setOpen(false);

 setEditing(null);

 await refresh();



 }catch(error){

 toast.error(
  error instanceof Error
  ? error.message
  : "ذخیره قالب ناموفق بود"
 );


 }finally{

 setSaving(false);

 }


}







async function remove(id:string){

 try{


 await deleteAdminNotificationTemplateApi(
  id
 );


 toast.success(
  "قالب حذف شد"
 );


 await refresh();


 }catch(error){

 toast.error(
  error instanceof Error
  ? error.message
  : "حذف ناموفق بود"
 );


 }


}






return (

<div className="space-y-6">



<AdminPageHeader

title="قالب پیام‌ها"

description="مدیریت متن پیام‌های سیستم"

actions={

<Button
 onClick={openCreate}
>

<Plus size={18}/>

افزودن قالب

</Button>

}

/>





<Card>


{

loading ?

<div className="p-6">

در حال بارگذاری...

</div>


:

<div className="divide-y">


{

templates.map(item=>(


<div

key={item.id}

className="flex justify-between p-5"

>


<div>


<div className="font-bold">

{item.title || item.eventKey}

</div>


<div className="text-sm">

{item.eventKey} / {item.channel}

</div>


<div className="text-sm text-muted-foreground">

{item.body}

</div>


</div>



<div className="flex gap-2 items-center">


<Badge>

{item.enabled?"فعال":"غیرفعال"}

</Badge>



<Button

size="sm"

variant="secondary"

onClick={()=>openEdit(item)}

>

<Pencil size={15}/>

</Button>



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


}


</Card>




<Modal

open={open}

onClose={() => setOpen(false)}

title={
 editing
 ? "ویرایش قالب پیام"
 : "افزودن قالب پیام"
}

>



<div className="space-y-4">



<select

required

data-field-label="رویداد"

className="w-full border rounded p-2"

value={draft.eventKey}

onChange={
e=>{

const selected =
 events.find(
  x=>x.key===e.target.value
 );


setDraft({

 ...draft,

 eventKey:e.target.value,

 variables:
  JSON.stringify(
   selected?.variables ?? [],
   null,
   2
  ),

});

}

}

>

<option value="">
انتخاب Event
</option>


{
events.map(event=>(

<option
key={event.key}
value={event.key}
>

{event.name} - {event.key}

</option>

))
}


</select>



<input

required

data-field-label="کانال ارسال"

className="w-full border rounded p-2"

placeholder="Channel"

value={draft.channel}

onChange={
e=>setDraft({
 ...draft,
 channel:e.target.value
})
}

/>




<input

className="w-full border rounded p-2"

placeholder="عنوان"

value={draft.title}

onChange={
e=>setDraft({
 ...draft,
 title:e.target.value
})
}

/>




<textarea

required

data-field-label="متن پیام"

className="w-full border rounded p-3 min-h-40"

placeholder="متن پیام"

value={draft.body}

onChange={
e=>setDraft({
 ...draft,
 body:e.target.value
})
}

/>



{
draft.eventKey &&
(
 events.find(
  x=>x.key===draft.eventKey
 )?.variables?.length ?? 0
) > 0 && (



<div className="border rounded p-3">

<div className="mb-2 font-bold">
متغیرهای قابل استفاده:
</div>


<div className="flex flex-wrap gap-2">




{
events
.find(
 x=>x.key===draft.eventKey
)
?.variables?.map(
(variable:string)=>(



<Badge key={variable}>
{"{{"+variable+"}}"}
</Badge>

))
}

</div>

</div>

)
}



<textarea

className="w-full border rounded p-3"

placeholder="Variables JSON"

value={draft.variables}

onChange={
e=>setDraft({
 ...draft,
 variables:e.target.value
})
}

/>





<label className="flex gap-2">

<input

type="checkbox"

checked={draft.enabled}

onChange={
e=>setDraft({
 ...draft,
 enabled:e.target.checked
})
}

/>

فعال

</label>





<div className="flex gap-2">


<Button

disabled={saving}

onClick={save}

>

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


</Modal>




</div>

);


}
