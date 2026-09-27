import type {
 PaymentProvider,
} from "./payment-provider";


import {
 ZarinpalProvider,
} from "./providers/zarinpal-provider";

import {
 LocalTestPaymentProvider,
} from "./providers/local-test-provider";



export function getPaymentProvider(
 provider:string,
 config:unknown,
):PaymentProvider{


 switch(provider){


  case "zarinpal":

   return new ZarinpalProvider(
    config,
   );


  case "local-test":

   return new LocalTestPaymentProvider();


  default:

   throw new Error(
    `Unsupported payment provider: ${provider}`
   );


 }


}
