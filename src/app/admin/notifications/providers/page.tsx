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
 AdminPageHeader,
} from "@/components/admin/admin-page-header";


import {
 Card,
} from "@/components/ui/card";


import {
 Button,
} from "@/components/ui/button";


import {
 Badge,
} from "@/components/ui/badge";


import {
 Modal,
} from "@/components/ui/modal";


import {
 toast,
} from "sonner";



import {

 getAdminNotificationProvidersApi,

 createAdminNotificationProviderApi,

 updateAdminNotificationProviderApi,

 deleteAdminNotificationProviderApi,

 testAdminNotificationProviderApi,

 getAdminNotificationProviderStatusApi,

} from "@/lib/api-client/admin";




type ProviderStatus = {

 connected:boolean;

 balance?:number;

 senders?:string[];

 message?:string;

};




type Provider = {

 id:string;

 name:string;

 provider:string;

 channel:string;

 enabled:boolean;

 isDefault:boolean;

 priority:number;

 config:unknown;

};





export default function NotificationProvidersPage(){


const [providers,setProviders] =
 useState<Provider[]>([]);



const [loading,setLoading] =
 useState(true);



const [open,setOpen] =
 useState(false);



const [editing,setEditing] =
 useState<Provider|null>(null);



const [providerStatuses,setProviderStatuses] =
 useState<Record<string,ProviderStatus>>({});




const [draft,setDraft] =
 useState({

  name:"",

  provider:"sms-webservice",

  channel:"sms",

  config:"{}",


  enabled:true,

  isDefault:false,

  priority:1,

 });



const [testReceiver,setTestReceiver] =
 useState("");

async function loadProviders(){

 try{

  setLoading(true);


  const result =
   await getAdminNotificationProvidersApi();



setProviders(
 result.providers
);


for(
 const provider of result.providers
){

 try{

  const status =
   await getAdminNotificationProviderStatusApi(
    provider.id
   );


  setProviderStatuses(
   prev=>({
    ...prev,
    [provider.id]:status
   })
  );


 }catch{

  setProviderStatuses(
   prev=>({
    ...prev,
    [provider.id]:{
     connected:false,
     message:"خطا در دریافت وضعیت"
    }
   })
  );

 }

}


 }catch(error){


  toast.error(
   error instanceof Error
   ?
   error.message
   :
   "خطا در دریافت Provider ها"
  );


 }finally{

  setLoading(false);

 }

}






async function loadProviderStatuses(){


 const result:
 Record<string,ProviderStatus> = {};



 for(const provider of providers){


  try{


   const status =
    await getAdminNotificationProviderStatusApi(
     provider.id
    );



   result[provider.id] =
    status;



  }catch(error){


   result[provider.id] = {

    connected:false,

    message:
     "خطا در دریافت وضعیت"

   };


  }


 }



 setProviderStatuses(
  result
 );


}







useEffect(()=>{


 loadProviders();


},[]);



async function openCreate(){

 setEditing(null);


 setDraft({

  name:"",

  provider:"sms-webservice",

  channel:"sms",

  config:"{}",


  enabled:true,

  isDefault:false,

  priority:1,

 });


 setOpen(true);

}





function openEdit(
 item:Provider
){


 setEditing(item);


 setDraft({

  name:item.name,

  provider:item.provider,

  channel:item.channel,

config:
 typeof item.config === "string"
 ?
 item.config
 :
 JSON.stringify(
  item.config,
  null,
  2
 ),


  enabled:item.enabled,

  isDefault:item.isDefault,

  priority:item.priority,

 });


 setOpen(true);

}







async function saveProvider(){


 try{


  const payload = {

   ...draft,

  };



  if(editing){


   await updateAdminNotificationProviderApi(

    editing.id,

    payload

   );


   toast.success(
    "Provider بروزرسانی شد"
   );


  }else{


await createAdminNotificationProviderApi({

name:draft.name,

provider:draft.provider,

channel:draft.channel,

config:JSON.parse(draft.config),

enabled:draft.enabled,

isDefault:draft.isDefault,

priority:draft.priority,

});


   toast.success(
    "Provider ایجاد شد"
   );


  }





  setOpen(false);


  await loadProviders();



 }catch(error){


  toast.error(

   error instanceof Error

   ?

   error.message

   :

   "خطا در ذخیره Provider"

  );


 }


}







async function removeProvider(
 id:string
){


 try{


  await deleteAdminNotificationProviderApi(
   id
  );


  toast.success(
   "Provider حذف شد"
  );


  await loadProviders();



 }catch(error){


  toast.error(

   error instanceof Error

   ?

   error.message

   :

   "خطا در حذف Provider"

  );


 }

}








async function testProvider(){


 try{


  await testAdminNotificationProviderApi({

   provider:
    draft.provider,


   config:
    JSON.parse(
     draft.config || "{}"
    ),


   receiver:
    testReceiver,


   message:
    "پیام تست BINIX",


  });



  toast.success(
   "تست پیام ارسال شد"
  );



 }catch(error){


  toast.error(

   error instanceof Error

   ?

   error.message

   :

   "خطا در تست پیام"

  );


 }


}

return (

<div className="space-y-6">


<AdminPageHeader

title="سرویس‌دهنده‌ها"

description="مدیریت Provider های ارسال پیام"

actions={

<Button
onClick={openCreate}
>

<Plus size={18}/>

افزودن سرویس‌دهنده

</Button>

}

/>


<Card>


{
loading

?

<div className="p-6">

در حال بارگذاری...

</div>


:


<div className="divide-y">


{

providers.map(

(item)=>(


<div

key={item.id}

className="flex justify-between p-5"

>


<div className="space-y-2">


<div className="font-bold">

{item.name}

</div>



<div className="text-sm">

Provider:

{" "}

{item.provider}

</div>




<div className="text-sm">

کانال:

{" "}

{item.channel}

</div>



{

providerStatuses[item.id]

&&


<div className="mt-4 space-y-1 text-sm">


<div>

وضعیت:

{" "}

{

providerStatuses[item.id].connected

?

"✅ متصل"

:

"❌ قطع"

}

</div>



<div>

اعتبار:

{" "}

{

providerStatuses[item.id].balance

??

"-"

}

</div>




<div>

شماره ارسال:

{" "}

{

providerStatuses[item.id]
.senders

?.join(
" ، "
)

??

"-"

}

</div>




{

providerStatuses[item.id].message

&&


<div className="text-xs">

{

providerStatuses[item.id].message

}

</div>


}



</div>


}



</div>





<div className="flex gap-2 items-center">


<Badge>

{

item.enabled

?

"فعال"

:

"غیرفعال"

}

</Badge>




{

item.isDefault

&&


<Badge>

پیش‌فرض

</Badge>


}




<Button

size="sm"

variant="secondary"

onClick={

()=>openEdit(item)

}

>

<Pencil size={15}/>

</Button>





<Button

size="sm"

variant="danger"

onClick={

()=>removeProvider(item.id)

}

>

<Trash2 size={15}/>

</Button>



</div>




</div>


)

)


}


</div>


}


</Card>

<Modal

open={open}

onClose={

()=>setOpen(false)

}

title={
 editing
 ?
 "ویرایش Provider"
 :
 "افزودن Provider"
}

description="تنظیمات سرویس‌دهنده پیام"

>


<div className="space-y-4">


<div className="font-bold text-lg">

{

editing

?

"ویرایش Provider"

:

"افزودن Provider"

}

</div>


{/* فرم در پارت ۵ */}


</div>


<div className="space-y-4">


<div>

<label className="text-sm">

نام Provider

</label>


<input

required

data-field-label="نام Provider"

className="w-full border rounded p-2"

value={draft.name}

onChange={

e=>

setDraft({

...draft,

name:e.target.value

})

}

/>

</div>





<div>

<label className="text-sm">

نوع Provider

</label>


<input

required

data-field-label="نوع Provider"

className="w-full border rounded p-2"

value={draft.provider}

onChange={

e=>

setDraft({

...draft,

provider:e.target.value

})

}

/>

</div>






<div>

<label className="text-sm">

کانال

</label>


<input

required

data-field-label="کانال"

className="w-full border rounded p-2"

value={draft.channel}

onChange={

e=>

setDraft({

...draft,

channel:e.target.value

})

}

/>

</div>






<div>

<label className="text-sm">

Config JSON

</label>



<textarea

required

data-field-label="Config JSON"

className="w-full border rounded p-2 min-h-32"

value={draft.config}

onChange={

e=>

setDraft({

...draft,

config:e.target.value

})

}

/>



</div>



<div className="flex gap-6 items-center">

  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={draft.enabled}
      onChange={
        e =>
          setDraft({
            ...draft,
            enabled:e.target.checked
          })
      }
    />

    فعال
  </label>


  <label className="flex items-center gap-2">

    <input
      type="checkbox"
      checked={draft.isDefault}
      onChange={
        e =>
          setDraft({
            ...draft,
            isDefault:e.target.checked
          })
      }
    />

    پیش‌فرض

  </label>


</div>



<div>

<label className="text-sm">
اولویت
</label>


<input

required

data-field-label="اولویت"

className="w-full border rounded p-2"

type="number"

value={draft.priority}

onChange={
 e =>
 setDraft({
  ...draft,
  priority:
   Number(e.target.value)
 })
}

/>

</div>



<div>

<label className="text-sm">

شماره تست

</label>


<input

className="w-full border rounded p-2"

placeholder="0912..."

value={testReceiver}

onChange={

e=>

setTestReceiver(
 e.target.value
)

}

/>

</div>







<div className="flex gap-2">


<Button

onClick={saveProvider}

>

ذخیره

</Button>





<Button

variant="secondary"

onClick={testProvider}

>

تست پیام

  </Button>

 </div>

</div>

</Modal>


</div>

);

}
