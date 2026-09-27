"use client";

import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Database,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const items = [
  {
    icon: Database,
    title: "منبع پاسخ روشن",
    description:
      "اطلاعات محصول، قیمت و موجودی باید از منبعی بیاید که خود کسب‌وکار آن را کنترل می‌کند.",
  },
  {
    icon: UserRound,
    title: "ورود اپراتور انسانی",
    description:
      "وقتی سؤال حساس یا خارج از محدوده باشد، مکالمه باید بتواند به انسان منتقل شود.",
  },
  {
    icon: BookOpenCheck,
    title: "قوانین پاسخ‌گویی",
    description:
      "لحن، شرایط فروش، ارسال، مرجوعی و پاسخ‌های مهم باید قبل از فعال‌سازی مشخص شوند.",
  },
  {
    icon: ShieldCheck,
    title: "مرز اطمینان",
    description:
      "فروشنده هوشمند نباید چیزی را که در داده کسب‌وکار تأیید نشده، با قطعیت به مشتری اعلام کند.",
  },
];

export default function AiSalesTrust() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-t border-marketing-border bg-[linear-gradient(180deg,#050A13,#07101D)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              قبل از راه‌اندازی
            </div>
            <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
              هوش مصنوعی باید سریع باشد؛ اما کنترل فروش باید دست شما بماند
            </h2>
            <p className="font-ui mt-4 max-w-[470px] text-[12.5px] leading-7 text-marketing-text-muted">
              برای سرویس B2B، کیفیت فقط به سرعت پاسخ نیست. مهم است که بدانیم پاسخ از کجا آمده، چه زمانی انسان وارد می‌شود و AI کجا باید توقف کند.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -3 }}
                  className="rounded-panel border border-marketing-border bg-marketing-surface/65 p-5"
                >
                  <div className="flex size-10 items-center justify-center rounded-control border border-service-accent/20 bg-service-accent/10 text-service-accent">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-display mt-4 text-base font-bold text-marketing-text">
                    {item.title}
                  </h3>
                  <p className="font-ui mt-2 text-[11.5px] leading-6 text-marketing-text-muted">
                    {item.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
