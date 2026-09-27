"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  WalletCards,
  Landmark,
  Bot,
  CheckCircle2,
  PlugZap,
} from "lucide-react";

import { toast } from "sonner";

import {
  createAdminPaymentGatewayApi,
  deleteAdminPaymentGatewayApi,
  getAdminPaymentGatewaysApi,
  updateAdminPaymentGatewayApi,
  testAdminPaymentGatewayApi,
  setDefaultAdminPaymentGatewayApi,
  type AdminPaymentGateway,
} from "@/lib/api-client/admin";


import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Modal,
} from "@/components/ui/modal";



type Draft = {
  name:string;
  slug:string;
  provider:string;
  enabled:boolean;
  priority:string;
  config:string;
};


const emptyDraft:Draft = {
  name:"",
  slug:"",
  provider:"",
  enabled:true,
  priority:"0",
  config:"{}",
};




function ProviderIcon({
 provider,
}:{
 provider:string;
}){

 const value =
 provider.toLowerCase();


 if(value.includes("bale")){
  return <Bot size={22}/>;
 }


 if(value.includes("zarin")){
  return <Landmark size={22}/>;
 }


 return <WalletCards size={22}/>;

}


export default function AdminPaymentGatewaysPage(){

  const [gateways,setGateways] =
    useState<AdminPaymentGateway[]>([]);

  const [loading,setLoading] =
    useState(true);

  const [search,setSearch] =
    useState("");

  const [editorOpen,setEditorOpen] =
    useState(false);

  const [editing,setEditing] =
    useState<AdminPaymentGateway|null>(null);

  const [draft,setDraft] =
    useState<Draft>(emptyDraft);

  const [saving,setSaving] =
    useState(false);

  const [pendingDelete,setPendingDelete] =
    useState<AdminPaymentGateway|null>(null);



  async function refresh(){

    setLoading(true);

    try{

      const result =
        await getAdminPaymentGatewaysApi();

      setGateways(result.gateways);


    }catch(error){

      toast.error(
        "دریافت درگاه‌ها انجام نشد",
        {
          description:
            error instanceof Error
            ? error.message
            : undefined,
        },
      );


    }finally{

      setLoading(false);

    }

  }



  useEffect(()=>{

    void refresh();

  },[]);




  const filtered =
    useMemo(()=>{

      const q =
        search
        .trim()
        .toLowerCase();


      if(!q)
        return gateways;


      return gateways.filter(
        item =>
          `${item.name} ${item.slug} ${item.provider}`
          .toLowerCase()
          .includes(q)
      );


    },[
      gateways,
      search,
    ]);




  function openCreate(){

    setEditing(null);

    setDraft(emptyDraft);

    setEditorOpen(true);

  }



  function openEdit(
    item:AdminPaymentGateway
  ){

    setEditing(item);

    setDraft({

      name:item.name,

      slug:item.slug,

      provider:item.provider,

      enabled:item.enabled,

      priority:String(item.priority),

      config:
        JSON.stringify(
          item.config,
          null,
          2
        ),

    });


    setEditorOpen(true);

  }




  async function save(){

    setSaving(true);


    try{


      const payload = {

        name:draft.name,

        slug:draft.slug,

        provider:draft.provider,

        enabled:draft.enabled,

        priority:
          Number(draft.priority)||0,

        config:
          JSON.parse(
            draft.config || "{}"
          ),

      };



      if(editing){


        await updateAdminPaymentGatewayApi(
          editing.id,
          payload
        );


        toast.success(
          "درگاه بروزرسانی شد"
        );


      }else{


        await createAdminPaymentGatewayApi(
          payload
        );


        toast.success(
          "درگاه ایجاد شد"
        );


      }



      setEditorOpen(false);

      await refresh();



    }catch(error){


      toast.error(
        "ذخیره انجام نشد",
        {
          description:
          error instanceof Error
          ? error.message
          : undefined,
        }
      );


    }finally{


      setSaving(false);


    }

  }




  async function remove(){


    if(!pendingDelete)
      return;


    try{


      await deleteAdminPaymentGatewayApi(
        pendingDelete.id
      );


      toast.success(
        "درگاه حذف شد"
      );


      setPendingDelete(null);


      await refresh();



    }catch(error){


      toast.error(
        "حذف انجام نشد",
        {
          description:
          error instanceof Error
          ? error.message
          : undefined,
        }
      );


    }

  }





async function testGateway(
 id:string
){

 try{

  const result =
   await testAdminPaymentGatewayApi(id);


  toast.success(
   result.message
  );


 }catch(error){

  toast.error(
   "تست اتصال ناموفق بود"
  );

 }

}



async function makeDefault(
 id:string
){

 try{

 await setDefaultAdminPaymentGatewayApi(id);

 toast.success(
  "درگاه پیش‌فرض شد"
 );

 await refresh();


 }catch(error){

 toast.error(
  "تغییر درگاه پیش‌فرض ناموفق بود"
 );

 }

}



return (

<div className="space-y-6">


<AdminPageHeader

title="درگاه‌های پرداخت"

description="مدیریت اتصال‌های پرداخت BINIX"

actions={

<Button

onClick={openCreate}

leadingIcon={<Plus size={18}/>}

>

افزودن درگاه

</Button>

}

/>



<AdminFilterBar>

<div className="relative w-full">

<Search

size={16}

className="absolute right-3 top-3 text-foreground-muted"

/>


<input

value={search}

onChange={
e=>setSearch(e.target.value)
}

placeholder="جستجوی درگاه..."

className="
h-10 w-full rounded-control
border border-border
bg-background
px-3 pr-10
"

/>


</div>

</AdminFilterBar>




{

loading

?

<AdminTableSkeleton/>


:

filtered.length===0


?

<AdminEmptyState

title="درگاهی وجود ندارد"

description="اولین درگاه پرداخت را اضافه کنید"

/>


:


<Card className="overflow-hidden">


<div className="divide-y divide-border">


{

filtered.map(item=>(


<div
key={item.id}
className="
flex flex-col gap-4 p-5
lg:flex-row lg:items-center lg:justify-between
"


>


<div className="flex items-center gap-4">


<div
className="
flex size-12 items-center justify-center
rounded-card
bg-primary/10
text-primary
"
>

<ProviderIcon provider={item.provider}/>

</div>


<div>

<div className="flex items-center gap-2 font-bold">

{item.name}


{
item.isDefault
?
<Badge>
پیش‌فرض
</Badge>
:
null
}

</div>


<div className="text-sm text-foreground-muted">

{item.provider} · {item.slug}

</div>


</div>


</div>




<div className="flex flex-wrap items-center gap-2">


<Badge>

{item.enabled ? "فعال":"غیرفعال"}

</Badge>


<span className="text-sm text-foreground-muted">

اولویت {item.priority}

</span>



<Button

variant="ai"

size="sm"

leadingIcon={<PlugZap size={15}/>}

onClick={()=>
testGateway(item.id)
}

>

تست اتصال

</Button>



{
!item.isDefault
&&

<Button

variant="secondary"

size="sm"

leadingIcon={<CheckCircle2 size={15}/>}

onClick={()=>
makeDefault(item.id)
}

>

پیش‌فرض

</Button>

}



<Button

variant="secondary"

size="sm"

leadingIcon={<Pencil size={15}/>}

onClick={()=>
openEdit(item)
}

>

ویرایش

</Button>



<Button

variant="danger"

size="sm"

leadingIcon={<Trash2 size={15}/>}

onClick={()=>
setPendingDelete(item)
}

>

حذف

</Button>



</div>



</div>


))


}


</div>


</Card>


}




<Modal

open={editorOpen}

onClose={()=>
setEditorOpen(false)
}

title={
editing
?
"ویرایش درگاه"
:
"افزودن درگاه"
}


footer={

<>

<Button

variant="secondary"

onClick={()=>
setEditorOpen(false)
}

>

لغو

</Button>



<Button

loading={saving}

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

data-field-label="نام درگاه"

value={draft.name}

onChange={
e=>setDraft({
...draft,
name:e.target.value
})
}

placeholder="نام درگاه"

className="
h-10 w-full rounded-control
border border-border px-3
"

/>




<input

required

data-field-label="Provider"

value={draft.provider}

disabled={Boolean(editing)}

onChange={
e=>setDraft({
...draft,
provider:e.target.value
})
}

placeholder="Provider"

className="
h-10 w-full rounded-control
border border-border px-3
disabled:opacity-50
"

/>




<input

required

data-field-label="Slug"

value={draft.slug}

disabled={Boolean(editing)}

onChange={
e=>setDraft({
...draft,
slug:e.target.value
})
}

placeholder="Slug"

className="
h-10 w-full rounded-control
border border-border px-3
disabled:opacity-50
"

/>




<input

type="number"

required

data-field-label="اولویت"

value={draft.priority}

onChange={
e=>setDraft({
...draft,
priority:e.target.value
})
}

placeholder="اولویت"

className="
h-10 w-full rounded-control
border border-border px-3
"

/>



<textarea

required

data-field-label="تنظیمات JSON"

rows={8}

value={draft.config}

onChange={
e=>setDraft({
...draft,
config:e.target.value
})
}

className="
w-full rounded-control
border border-border p-3
font-mono text-sm
"

/>



<label className="flex items-center gap-2">

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

فعال باشد

</label>



</div>


</Modal>





<Modal

open={Boolean(pendingDelete)}

onClose={()=>
setPendingDelete(null)
}

title="حذف درگاه"


footer={

<>

<Button

variant="secondary"

onClick={()=>
setPendingDelete(null)
}

>

لغو

</Button>



<Button

variant="danger"

onClick={remove}

>

حذف

</Button>


</>

}

>


آیا از حذف این درگاه مطمئن هستید؟

</Modal>




</div>

);


}
