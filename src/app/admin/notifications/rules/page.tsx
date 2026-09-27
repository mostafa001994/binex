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
 getAdminNotificationRulesApi,
 createAdminNotificationRuleApi,
 updateAdminNotificationRuleApi,
 deleteAdminNotificationRuleApi,
 type AdminNotificationRule,
} from "@/lib/api-client/admin";


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



type Draft = {

 name:string;

 eventKey:string;

 channel:string;

 enabled:boolean;

 delayDays:string;

};



const emptyDraft:Draft={

 name:"",

 eventKey:"subscription.expiring",

 channel:"sms",

 enabled:true,

 delayDays:"0",

};



export default function AdminNotificationRulesPage(){


const [rules,setRules]=
 useState<AdminNotificationRule[]>([]);


const [loading,setLoading]=
 useState(true);


const [open,setOpen]=
 useState(false);


const [editing,setEditing]=
 useState<AdminNotificationRule|null>(null);


const [draft,setDraft]=
 useState<Draft>(emptyDraft);



async function refresh(){

 try{

  setLoading(true);

  const result =
   await getAdminNotificationRulesApi();

  setRules(result.rules);


 }catch(error){

  toast.error(
   "دریافت قوانین انجام نشد"
  );

 }finally{

  setLoading(false);

 }

}



useEffect(()=>{

 void refresh();

},[]);




function edit(item:AdminNotificationRule){

 setEditing(item);

 setDraft({

  name:item.name,

  eventKey:item.eventKey,

  channel:item.channel,

  enabled:item.enabled,

  delayDays:String(item.delayDays),

 });

 setOpen(true);

}



function create(){

 setEditing(null);

 setDraft(emptyDraft);

 setOpen(true);

}




async function save(){

 try{


 const payload={

  name:draft.name,

  eventKey:draft.eventKey,

  channel:draft.channel,

  enabled:draft.enabled,

  delayDays:Number(draft.delayDays)||0,

 };



 if(editing){

  await updateAdminNotificationRuleApi(
   editing.id,
   payload
  );

  toast.success(
   "قانون بروزرسانی شد"
  );


 }else{


  await createAdminNotificationRuleApi(
   payload
  );


  toast.success(
   "قانون ایجاد شد"
  );

 }


 setOpen(false);

 await refresh();


 }catch(error){

 toast.error(
  "ذخیره انجام نشد"
 );

 }


}




async function remove(
 item:AdminNotificationRule
){

 try{

  await deleteAdminNotificationRuleApi(
   item.id
  );


  toast.success(
   "حذف شد"
  );


  await refresh();


 }catch{

  toast.error(
   "حذف انجام نشد"
  );

 }

}



return (

<div className="space-y-6">


<AdminPageHeader

title="قوانین اطلاع‌رسانی"

description="مدیریت زمان‌بندی و ارسال پیام‌های سیستم"

actions={

<Button

onClick={create}

leadingIcon={<Plus size={18}/>}

>

افزودن قانون

</Button>

}

/>



<Card className="overflow-hidden">


<div className="divide-y divide-border">


{

loading

?

<div className="p-6">

در حال بارگذاری...

</div>


:


rules.map(rule=>(


<div

key={rule.id}

className="flex items-center justify-between p-5"

>


<div>


<div className="font-bold">

{rule.name}

</div>


<div className="text-sm text-foreground-muted">

{rule.eventKey}

 · {rule.channel}

 · {rule.delayDays} روز

</div>


</div>



<div className="flex items-center gap-2">


<Badge>

{rule.enabled ? "فعال":"غیرفعال"}

</Badge>



<Button

size="sm"

variant="secondary"

onClick={()=>edit(rule)}

leadingIcon={<Pencil size={15}/>}

>

ویرایش

</Button>



<Button

size="sm"

variant="danger"

onClick={()=>remove(rule)}

leadingIcon={<Trash2 size={15}/>}

>

حذف

</Button>


</div>


</div>


))

}


</div>


</Card>




<Modal

open={open}

onClose={()=>setOpen(false)}

title={
 editing
 ?
 "ویرایش قانون"
 :
 "افزودن قانون"
}


footer={

<>

<Button

variant="secondary"

onClick={()=>setOpen(false)}

>

لغو

</Button>


<Button

onClick={save}

>

ذخیره

</Button>

</>

}

>


<div className="space-y-4">


<input

required

data-field-label="نام قانون"

className="h-10 w-full rounded-control border px-3"

placeholder="نام قانون"

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

data-field-label="کلید رویداد"

className="h-10 w-full rounded-control border px-3"

placeholder="event key"

value={draft.eventKey}

onChange={
e=>setDraft({
 ...draft,
 eventKey:e.target.value
})
}

/>



<input

required

data-field-label="کانال ارسال"

className="h-10 w-full rounded-control border px-3"

placeholder="channel"

value={draft.channel}

onChange={
e=>setDraft({
 ...draft,
 channel:e.target.value
})
}

/>



<input

required

type="number"

min="0"

data-field-label="تعداد روز"

className="h-10 w-full rounded-control border px-3"

placeholder="تعداد روز"

value={draft.delayDays}

onChange={
e=>setDraft({
 ...draft,
 delayDays:e.target.value
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


</div>


</Modal>


</div>

);

}
