"use client";

import {
  motion,
} from "framer-motion";
import {
  ArrowLeft,
  Check,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { iconRegistry } from "@/constants/icon-registry";
import { usePublicServices } from "@/hooks/use-public-services";

const container = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
    },
  },
};

export default function Products() {
  const {
    services,
    error,
  } = usePublicServices();

  return (
    <section
      id="products"
      dir="rtl"
      className="relative overflow-hidden border-y border-marketing-border bg-[linear-gradient(180deg,rgba(7,17,31,.28),rgba(4,8,18,.05))] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute -right-36 top-20 size-[420px] rounded-full bg-primary/[0.06] blur-[100px]" />

      <div className="relative mx-auto max-w-[1280px]">
        <SectionHeading
          badge="سرویس‌های Binix"
          title="برای هر مسئله، یک سرویس هوشمند"
          description="هر سرویس مستقل راه‌اندازی می‌شود؛ بنابراین می‌توانید از مهم‌ترین نیاز کسب‌وکارتان شروع کنید."
          className="mb-10 sm:mb-12"
        />

        {error ? (
          <div className="rounded-card border border-marketing-border bg-marketing-surface p-6 text-center font-ui text-sm text-marketing-text-muted">
            دریافت سرویس‌ها در حال حاضر انجام نشد.
          </div>
        ) : !services ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[0, 1, 2].map(
              (value) => (
                <div
                  key={value}
                  className="h-72 animate-pulse rounded-card border border-marketing-border bg-marketing-surface"
                />
              ),
            )}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
              amount: 0.12,
            }}
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-4"
          >
            {services.map(
              (service) => {
                const isSalesAgent = service.id === "sales-agent";
                const isAvailable = service?.availability === "available";
                const Icon =
                  iconRegistry[
                    service.iconKey
                  ] ||
                  iconRegistry[
                    "layout-grid"
                  ];

                return (
                  <motion.a
                    key={
                      service.id
                    }
                    variants={item}
                    whileHover={{
                      y: -4,
                    }}
                    href={
                      service.marketingHref
                    }
                    className={`group relative overflow-hidden rounded-card border bg-marketing-surface/80 p-6 transition hover:border-white/[0.14] ${isSalesAgent ? "border-accent/35 shadow-[0_18px_55px_rgba(0,139,255,.09)] sm:col-span-2 md:col-span-1" : "border-marketing-border"}`}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-px opacity-70"
                      style={{
                        background:
                          `linear-gradient(90deg, transparent, ${service.accent}, transparent)`,
                      }}
                    />

                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex size-11 items-center justify-center rounded-control border"
                        style={{
                          color:
                            service.accent,
                          borderColor:
                            `color-mix(in srgb, ${service.accent} 25%, transparent)`,
                          background:
                            `color-mix(in srgb, ${service.accent} 10%, transparent)`,
                        }}
                      >
                        <Icon
                          size={20}
                        />
                      </div>

                      <span
                        className="font-ui rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                        style={{
                          color:
                            service.accent,
                          borderColor:
                            `color-mix(in srgb, ${service.accent} 24%, transparent)`,
                          background:
                            `color-mix(in srgb, ${service.accent} 8%, transparent)`,
                        }}
                      >
                        {isSalesAgent
                          ? "آماده دمو"
                          : isAvailable
                            ? "قابل بررسی"
                            : service.id === "bi"
                              ? "در نقشه راه"
                              : "در حال توسعه"}
                      </span>
                    </div>

                    <h3 className="font-display mt-5 text-xl font-bold text-marketing-text">
                      {service.name}
                    </h3>

                    <p className="font-ui mt-2 min-h-14 text-[12.5px] leading-7 text-marketing-text-muted">
                      {
                        service.description
                      }
                    </p>

                    {service.features
                      .length ? (
                      <ul className="mt-4 space-y-2">
                        {service.features
                          .slice(0, 3)
                          .map(
                            (
                              feature,
                            ) => (
                              <li
                                key={
                                  feature
                                }
                                className="font-ui flex items-center gap-2 text-[11px] text-marketing-text-muted"
                              >
                                <span
                                  className="flex size-4 items-center justify-center rounded-full"
                                  style={{
                                    color:
                                      service.accent,
                                    background:
                                      `color-mix(in srgb, ${service.accent} 10%, transparent)`,
                                  }}
                                >
                                  <Check
                                    size={
                                      10
                                    }
                                  />
                                </span>
                                {
                                  feature
                                }
                              </li>
                            ),
                          )}
                      </ul>
                    ) : null}

                    <div
                      className="mt-6 flex items-center justify-end gap-2 border-t border-marketing-border pt-4 font-ui text-xs font-semibold"
                      style={{
                        color:
                          service.accent,
                      }}
                    >
                      {isSalesAgent
                        ? "درخواست دمو"
                        : isAvailable
                          ? "مشاهده سرویس"
                          : service.id === "bi"
                            ? "ثبت نیاز BI"
                            : "عضویت در لیست انتظار"}
                      <ArrowLeft
                        size={14}
                        className="transition group-hover:-translate-x-1"
                      />
                    </div>
                  </motion.a>
                );
              },
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
