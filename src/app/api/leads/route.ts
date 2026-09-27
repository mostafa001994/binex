import { NextResponse } from "next/server";
import { getPrismaClient } from "@/server/db/prisma";

const cleanOptional = (value: unknown, maxLength: number) => {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized.slice(0, maxLength) : null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const phone = String(body.phone ?? "").replace(/\s|-/g, "");
    const legacyProduct = cleanOptional(body.product, 120);
    const need = cleanOptional(body.need, 120) ?? legacyProduct;
    const consent = body.consent === true || Boolean(legacyProduct);

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "شماره موبایل معتبر نیست.",
        },
        { status: 400 }
      );
    }

    if (!need) {
      return NextResponse.json(
        {
          success: false,
          message: "نیاز اصلی کسب‌وکار را انتخاب کنید.",
        },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        {
          success: false,
          message: "تأیید تماس برای ثبت درخواست لازم است.",
        },
        { status: 400 }
      );
    }

    if (cleanOptional(body.website, 200)) {
      return NextResponse.json({ success: true });
    }

    const prisma = getPrismaClient();

    await prisma.$transaction(async (tx) => {
      const lead = await tx.consultationLead.create({
        data: {
          phone,
          name: cleanOptional(body.name, 120),
          businessName: cleanOptional(body.businessName, 160),
          businessType: cleanOptional(body.businessType, 100),
          need,
          channel: cleanOptional(body.channel, 100),
          note: cleanOptional(body.note, 1000),
          source: cleanOptional(body.source, 80) ?? "homepage",
          consentAt: new Date(),
        },
      });

      const recipients = await tx.user.findMany({
        where: {
          status: "ACTIVE",
          accessRole: {
            permissions: {
              some: { permissionCode: "admin.leads.read" },
            },
          },
        },
        select: { id: true },
      });

      if (recipients.length) {
        await tx.notification.createMany({
          data: recipients.map((recipient) => ({
            userId: recipient.id,
            kind: "INFO",
            title: "درخواست مشاوره جدید",
            message: `${need} · ${phone}`,
            href: `/admin/leads?focus=${lead.id}`,
          })),
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Consultation lead save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.",
      },
      { status: 500 }
    );
  }
}
