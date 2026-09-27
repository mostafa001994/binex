import Link from "next/link";

import {
  getPrismaClient,
} from "@/server/db/prisma";


export const dynamic = "force-dynamic";


export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderId?: string;
  }>;
}) {


  const params = await searchParams;

  const orderId = params.orderId;


  let serviceName = null;
  let serviceId = null;
  let isCustomService = false;


  if(orderId){

    const prisma = getPrismaClient();


    const order =
      await prisma.order.findUnique({

        where:{
          id:orderId,
        },

        include:{
          items:{
            include:{
              service:true,
            },
          },
        },

      });


    const item =
      order?.items[0];


    if(item){

      serviceName =
        item.serviceNameSnapshot;

      serviceId =
        item.serviceId;

      isCustomService =
        item.type === "CUSTOM_SERVICE";

    }

  }



  return (

    <main
      style={{
        minHeight:"100vh",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        direction:"rtl",
        fontFamily:"sans-serif",
      }}
    >

      <div
        style={{
          textAlign:"center",
          padding:"40px",
        }}
      >

        <div
          style={{
            fontSize:"64px",
            marginBottom:"20px",
          }}
        >
          ✅
        </div>


        <h1>
          پرداخت موفق بود
        </h1>


        <p>
          پرداخت شما با موفقیت تایید شد.
        </p>


        {
          serviceName && (

            <div
              style={{
                marginTop:"24px",
                padding:"20px",
                border:"1px solid #ddd",
                borderRadius:"12px",
              }}
            >

              <h2>
                سرویس شما:
              </h2>

              <strong>
                {serviceName}
              </strong>


              <p>
                {isCustomService ? "اشتراک اختصاصی شما فعال شد." : "سرویس شما فعال شد."}
                {!isCustomService ? <><br />برای استفاده، تنظیمات اولیه را تکمیل کنید.</> : null}
              </p>


            </div>

          )
        }



        {
          isCustomService ? (
            <Link
              href="/app/custom-services"
              style={{ display:"inline-block", marginTop:"24px", padding:"12px 28px", borderRadius:"8px", background:"#111", color:"#fff", textDecoration:"none" }}
            >
              مشاهده سرویس اختصاصی
            </Link>
          ) : serviceId === "sales-agent" ? (

            <Link
              href="/app/services/sales-agent"
              style={{
                display:"inline-block",
                marginTop:"24px",
                padding:"12px 28px",
                borderRadius:"8px",
                background:"#111",
                color:"#fff",
                textDecoration:"none",
              }}
            >
              شروع راه‌اندازی فروشنده هوشمند
            </Link>

          ) : (

            <Link
              href="/app/services"
              style={{
                display:"inline-block",
                marginTop:"24px",
                padding:"12px 28px",
                borderRadius:"8px",
                background:"#111",
                color:"#fff",
                textDecoration:"none",
              }}
            >
              مشاهده سرویس‌ها
            </Link>

          )
        }


      </div>

    </main>

  );

}
