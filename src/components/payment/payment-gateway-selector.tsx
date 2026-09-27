"use client";

import {
 useEffect,
 useState,
} from "react";

import {
 getPaymentGatewaysApi,
 type PaymentGateway,
} from "@/lib/api-client/payment-gateways";

import {
 startPaymentApi,
} from "@/lib/api-client/payment";


import {
 Modal,
} from "@/components/ui/modal";



export function PaymentGatewaySelector({
 open,
 onClose,
 paymentId,
}:{
 open:boolean;
 onClose:()=>void;
 paymentId:string;
}){


 const [gateways,setGateways]=
 useState<PaymentGateway[]>([]);


 const [loading,setLoading]=
 useState(false);



 useEffect(()=>{

  if(open){

   getPaymentGatewaysApi()
    .then(x=>setGateways(x.gateways));

  }

 },[open]);



 async function selectGateway(
  gatewayId:string
 ){

  setLoading(true);

  const result =
await startPaymentApi({
  paymentId,
  gatewayId,
});

  window.location.assign(
   result.paymentUrl
  );

 }



 return (

 <Modal
  open={open}
  onClose={onClose}
  title="انتخاب درگاه پرداخت"
 >

 <div className="space-y-3">

 {
 gateways.map(item=>(

 <button

 key={item.id}

 disabled={loading}

 onClick={()=>
  selectGateway(item.id)
 }

 className="
 w-full
 border
 rounded
 p-4
 flex
 items-center
 gap-3
 "
 >

 {
 item.logoUrl &&
 <img
 src={item.logoUrl}
 className="w-8 h-8"
 />
 }

 <span>
 {item.name}
 </span>


 </button>

 ))

 }

 </div>


 </Modal>

 );


}
