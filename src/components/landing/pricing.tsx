"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ArrowLeft,
  Check,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { iconRegistry } from "@/constants/icon-registry";
import { usePublicServices } from "@/hooks/use-public-services";

export default function Pricing() {
  const { services } =
    usePublicServices();
  const [activeId, setActiveId] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    if (
      services?.length &&
      !activeId
    ) {
      setActiveId(
        services[0].id,
      );
    }
  }, [services, activeId]);

  const active = useMemo(
    () =>
      services?.find(
        (service) =>
          service.id ===
          activeId,
      ) ??
      services?.[0] ??
      null,
    [services, activeId],
  );

  return (
    <section
      id="pricing"
      dir="rtl"
      className="relative overflow-hidden border-t border-marketing-border bg-marketing-background px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <motion.div
        animate={{
          opacity: [
            0.22,
            0.35,
            0.22,
          ],
          scale: [
            1,
            1.06,
            1,
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute right-1/2 top-24 size-[480px] translate-x-1/2 rounded-full bg-primary/[0.035] blur-[120px]"
      />

      <div className="relative mx-auto max-w-[1120px]">
        <SectionHeading
          badge="انتخاب راهکار"
          title="از مهم‌ترین نیاز کسب‌وکارتان شروع کنید"
          description="قیمت‌گذاری هنوز نهایی نشده است. در این مرحله می‌توانید وضعیت هر سرویس را ببینید و مسیر مناسب برای بررسی نیازتان را انتخاب کنید."
          className="mb-10"
        />

        {!services ? (
          <div className="h-[430px] animate-pulse rounded-panel border border-marketing-border bg-marketing-surface" />
        ) : services.length === 0 ? (
          <div className="rounded-panel border border-marketing-border bg-marketing-surface p-8 text-center font-ui text-sm text-marketing-text-muted">
            در حال حاضر سرویس عمومی فعالی برای نمایش وجود ندارد.
          </div>
        ) : active ? (
          <div className="grid overflow-hidden rounded-panel border border-marketing-border bg-marketing-surface/60 lg:grid-cols-[320px_1fr]">
            <div className="border-b border-marketing-border p-3 lg:border-b-0 lg:border-l">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
                {services.map(
                  (
                    service,
                    index,
                  ) => {
                    const Icon =
                      iconRegistry[
                        service.iconKey
                      ] ??
                      iconRegistry[
                        "layout-grid"
                      ];

                    const selected =
                      active.id ===
                      service.id;

                    return (
                      <motion.button
                        key={
                          service.id
                        }
                        type="button"
                        onClick={() =>
                          setActiveId(
                            service.id,
                          )
                        }
                        aria-pressed={
                          selected
                        }
                        initial={{
                          opacity: 0,
                          x: 10,
                        }}
                        whileInView={{
                          opacity: 1,
                          x: 0,
                        }}
                        viewport={{
                          once: true,
                        }}
                        transition={{
                          delay:
                            index *
                            0.05,
                        }}
                        whileHover={{
                          y: -2,
                        }}
                        className={
                          selected
                            ? "font-ui flex min-w-[190px] items-center gap-3 rounded-card border p-3 text-right lg:w-full lg:min-w-0"
                            : "font-ui flex min-w-[190px] items-center gap-3 rounded-card border border-transparent p-3 text-right text-marketing-text-muted transition hover:border-marketing-border hover:bg-white/[0.025] lg:w-full lg:min-w-0"
                        }
                        style={
                          selected
                            ? {
                                borderColor:
                                  `color-mix(in srgb, ${service.accent} 25%, transparent)`,
                                background:
                                  `color-mix(in srgb, ${service.accent} 8%, transparent)`,
                              }
                            : undefined
                        }
                      >
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-control border"
                          style={{
                            color:
                              service.accent,
                            borderColor:
                              `color-mix(in srgb, ${service.accent} 20%, transparent)`,
                            background:
                              `color-mix(in srgb, ${service.accent} 10%, transparent)`,
                          }}
                        >
                          <Icon
                            size={
                              18
                            }
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="font-display truncate text-sm font-bold text-marketing-text">
                            {
                              service.name
                            }
                          </div>
                          <div className="mt-1 text-[10px] text-marketing-text-subtle">
                            {service?.availability ===
                            "coming-soon"
                              ? "در حال توسعه"
                              : service.id === "sales-agent"
                                ? "آماده دمو"
                                : "قابل بررسی"}
                          </div>
                        </div>
                      </motion.button>
                    );
                  },
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -18,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="relative min-h-[430px] overflow-hidden p-6 sm:p-8 lg:p-10"
              >
                <div
                  className="pointer-events-none absolute -left-20 -top-20 size-[300px] rounded-full blur-[80px]"
                  style={{
                    background:
                      `color-mix(in srgb, ${active.accent} 9%, transparent)`,
                  }}
                />

                <div className="relative grid gap-8 md:grid-cols-[1fr_.8fr] md:items-center">
                  <div>
                    <div
                      className="font-ui inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                      style={{
                        color:
                          active.accent,
                        borderColor:
                          `color-mix(in srgb, ${active.accent} 20%, transparent)`,
                        background:
                          `color-mix(in srgb, ${active.accent} 10%, transparent)`,
                      }}
                    >
                      {
                        active.category
                      }
                    </div>

                    <h3 className="font-display mt-4 text-2xl font-bold text-marketing-text sm:text-3xl">
                      {active.name}
                    </h3>

                    <p className="font-ui mt-4 max-w-[560px] text-[13px] leading-8 text-marketing-text-muted">
                      {
                        active.description
                      }
                    </p>

                    <motion.a
                      href={
                        active.marketingHref
                      }
                      whileHover={{
                        y: -2,
                        x: -3,
                      }}
                      className="font-ui mt-7 inline-flex h-11 items-center gap-2 rounded-control px-5 text-xs font-bold text-white"
                      style={{
                        background:
                          active.accent,
                      }}
                    >
                      {active.id === "sales-agent"
                        ? "درخواست دمو"
                        : active.id === "bi"
                          ? "ثبت نیاز BI"
                          : active.availability === "coming-soon"
                            ? "عضویت در لیست انتظار"
                            : "مشاهده سرویس"}
                      <ArrowLeft
                        size={14}
                      />
                    </motion.a>
                  </div>

                  <div
                    className="rounded-card border p-5"
                    style={{
                      borderColor:
                        `color-mix(in srgb, ${active.accent} 15%, transparent)`,
                      background:
                        `color-mix(in srgb, ${active.accent} 4%, transparent)`,
                    }}
                  >
                    <div
                      className="font-ui text-[11px] font-semibold"
                      style={{
                        color:
                          active.accent,
                      }}
                    >
                      چه چیزی دریافت می‌کنید؟
                    </div>

                    <div className="mt-4 space-y-4">
                      {active.features.map(
                        (
                          feature,
                        ) => (
                          <div
                            key={
                              feature
                            }
                            className="font-ui flex items-center gap-2.5 text-[12px] text-marketing-text-muted"
                          >
                            <span
                              className="flex size-5 shrink-0 items-center justify-center rounded-full"
                              style={{
                                color:
                                  active.accent,
                                background:
                                  `color-mix(in srgb, ${active.accent} 10%, transparent)`,
                              }}
                            >
                              <Check
                                size={
                                  12
                                }
                                strokeWidth={
                                  2.5
                                }
                              />
                            </span>
                            {feature}
                          </div>
                        ),
                      )}
                    </div>

                    <div className="mt-6 h-px bg-marketing-border" />
                    <p className="font-ui mt-5 text-[10.5px] leading-6 text-marketing-text-subtle">
                      وضعیت آمادگی سرویس‌ها شفاف نمایش داده می‌شود. جزئیات قیمت پس از نهایی‌شدن مدل تجاری منتشر خواهد شد.
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </section>
  );
}
