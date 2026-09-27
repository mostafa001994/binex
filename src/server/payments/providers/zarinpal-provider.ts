import type {
  PaymentProvider,
  PaymentRequestInput,
  PaymentRequestResult,
  PaymentVerifyInput,
  PaymentVerifyResult,
} from "../payment-provider";


type ZarinpalConfig = {

  merchantId:string;

  sandbox?:boolean;

};



export class ZarinpalProvider
implements PaymentProvider {


  private config:ZarinpalConfig;



  constructor(
    config:unknown,
  ){

    this.config =
      config as ZarinpalConfig;

  }




  async requestPayment(
    input:PaymentRequestInput,
  ):Promise<PaymentRequestResult>{


    if(!this.config.merchantId){

      throw new Error(
        "Zarinpal merchantId تنظیم نشده است"
      );

    }



    const endpoint =
      this.config.sandbox
      ?
      "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
      :
      "https://payment.zarinpal.com/pg/v4/payment/request.json";



console.log(
  "ZARINPAL REQUEST:",
  JSON.stringify({
    merchant_id: this.config.merchantId,
    amount: Number(input.amount),
    callback_url: input.callbackUrl,
  }, null, 2)
);


    const response =
      await fetch(
        endpoint,
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json",
            Accept:"application/json",
          },

          body:JSON.stringify({

            merchant_id:
              this.config.merchantId,


            amount:
              Number(input.amount),


            description:
              input.description,


            callback_url:
              input.callbackUrl,


            metadata:
              input.metadata ?? {},

          }),

        },
      );



    const result =
      await response.json();


console.log(
  "ZARINPAL RESPONSE:",
  JSON.stringify(result, null, 2)
);


    if(
      !result.data ||
      result.data.code !== 100
    ){

      throw new Error(
        result.errors?.[0]?.message ??
        "خطا در ایجاد پرداخت زرین پال"
      );

    }



    const authority =
      result.data.authority;



    return {

      authority,

      paymentUrl:
        (
          this.config.sandbox
          ?
          "https://sandbox.zarinpal.com/pg/StartPay/"
          :
          "https://payment.zarinpal.com/pg/StartPay/"
        )
        +
        authority,

    };


  }






  async verifyPayment(
    input:PaymentVerifyInput,
  ):Promise<PaymentVerifyResult>{



    const endpoint =
      this.config.sandbox
      ?
      "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
      :
      "https://payment.zarinpal.com/pg/v4/payment/verify.json";



    const response =
      await fetch(
        endpoint,
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json",
            Accept:"application/json",
          },


          body:JSON.stringify({

            merchant_id:
              this.config.merchantId,


            amount:
              Number(input.amount),


            authority:
              input.authority,

          }),

        },
      );



    const result =
      await response.json();



    return {

      success:
        result.data?.code === 100 ||
        result.data?.code === 101,


      referenceId:
        result.data?.ref_id
        ?
        String(result.data.ref_id)
        :
        undefined,

    };


  }


}
