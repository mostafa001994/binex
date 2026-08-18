"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpLeft,
  BrainCircuit,
  ChartNoAxesCombined,
  Check,
  ChevronLeft,
  Cpu,
  Menu,
  Network,
  Settings2,
  Sparkles,
  Target,
  Workflow,
  X,
} from "lucide-react";
import { useState } from "react";

const services = [
  {
    icon: BrainCircuit,
    title: "مدیریت هوشمند",
    text: "ترکیب دانش مدیریت و هوش مصنوعی برای تصمیم‌گیری سریع‌تر و دقیق‌تر.",
  },
  {
    icon: Workflow,
    title: "اتوماسیون کسب‌وکار",
    text: "شناسایی و هوشمندسازی فرآیندهای تکراری برای کاهش هزینه و افزایش بهره‌وری.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "تحلیل و تصمیم‌سازی",
    text: "تبدیل داده‌های کسب‌وکار به بینش‌های قابل استفاده برای مدیران.",
  },
  {
    icon: Settings2,
    title: "بهینه‌سازی عملیات",
    text: "بازطراحی فرآیندها و ایجاد سیستم‌های مدیریتی مقیاس‌پذیر.",
  },
];

const process = [
  {
    number: "01",
    title: "شناخت",
    text: "کسب‌وکار، چالش‌ها و فرصت‌های شما را بررسی می‌کنیم.",
  },
  {
    number: "02",
    title: "استراتژی",
    text: "یک نقشه راه متناسب با اهداف و منابع شما طراحی می‌کنیم.",
  },
  {
    number: "03",
    title: "پیاده‌سازی",
    text: "راهکارهای مدیریتی و AI را در سازمان شما اجرا می‌کنیم.",
  },
  {
    number: "04",
    title: "بهینه‌سازی",
    text: "نتایج را اندازه‌گیری و سیستم را به‌صورت مستمر بهبود می‌دهیم.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute right-[10%] top-[-15%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[10%] left-[-10%] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="#" className="text-2xl font-black tracking-[0.18em]">
          BINEX<span className="text-cyan-400">.</span>
        </a>

        <div className="hidden items-center gap-9 text-sm text-zinc-400 md:flex">
          <a className="transition hover:text-white" href="#services">
            خدمات
          </a>
          <a className="transition hover:text-white" href="#about">
            درباره ما
          </a>
          <a className="transition hover:text-white" href="#process">
            رویکرد ما
          </a>
          <a className="transition hover:text-white" href="#contact">
            تماس
          </a>
        </div>

        <a
          href="#contact"
          className="hidden rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm transition hover:border-cyan-400/40 hover:bg-cyan-400/10 md:block"
        >
          شروع همکاری
        </a>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-xl border border-white/10 p-2 md:hidden"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        {menuOpen && (
          <div className="absolute left-6 right-6 top-20 rounded-2xl border border-white/10 bg-[#0b0f16]/95 p-5 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-5 text-sm text-zinc-300">
              <a href="#services" onClick={() => setMenuOpen(false)}>
                خدمات
              </a>
              <a href="#about" onClick={() => setMenuOpen(false)}>
                درباره ما
              </a>
              <a href="#process" onClick={() => setMenuOpen(false)}>
                رویکرد ما
              </a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>
                تماس
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-16 lg:px-8 lg:pb-40 lg:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-xs text-cyan-300">
              <Sparkles size={14} />
              مدیریت نسل جدید با هوش مصنوعی
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl">
              آینده مدیریت،
              <br />
              <span className="bg-gradient-to-l from-cyan-300 via-blue-400 to-white bg-clip-text text-transparent">
                هوشمند است.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
              Binex به کسب‌وکارها کمک می‌کند با ترکیب مدیریت حرفه‌ای، داده و
              هوش مصنوعی، سریع‌تر تصمیم بگیرند، بهتر اجرا کنند و هوشمندانه‌تر
              رشد کنند.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="group flex items-center justify-center gap-3 rounded-full bg-cyan-400 px-7 py-4 font-bold text-black transition hover:bg-cyan-300"
              >
                مشاوره و شروع همکاری
                <ArrowLeft
                  size={18}
                  className="transition group-hover:-translate-x-1"
                />
              </a>

              <a
                href="#services"
                className="flex items-center justify-center rounded-full border border-white/10 px-7 py-4 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                خدمات Binex
              </a>
            </div>
          </motion.div>

          {/* AI Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            className="relative"
          >
            <div className="absolute inset-10 rounded-full bg-cyan-400/10 blur-[80px]" />

            <div className="relative mx-auto max-w-[520px]">
              <div className="rounded-[32px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
                <div className="rounded-[24px] border border-white/10 bg-[#080c12] p-5">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">BINEX AI</p>
                      <p className="mt-1 font-bold">داشبورد مدیریتی</p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <Cpu size={18} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["بهره‌وری", "+32%", "text-cyan-300"],
                      ["رشد", "+24%", "text-blue-300"],
                      ["هزینه عملیاتی", "-18%", "text-emerald-300"],
                      ["تصمیم‌گیری", "3.2x", "text-purple-300"],
                    ].map(([title, value, color]) => (
                      <div
                        key={title}
                        className="rounded-2xl border border-white/5 bg-white/[0.025] p-4"
                      >
                        <p className="text-xs text-zinc-500">{title}</p>
                        <p className={`mt-2 text-xl font-bold ${color}`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.025] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        عملکرد سازمان
                      </span>
                      <span className="text-xs text-cyan-300">
                        +18.4%
                      </span>
                    </div>

                    <div className="flex h-36 items-end gap-2">
                      {[35, 45, 40, 62, 55, 72, 68, 84, 78, 96, 88, 100].map(
                        (height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{
                              delay: 0.5 + i * 0.04,
                              duration: 0.5,
                            }}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-500/20 to-cyan-300"
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-black">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">
                        پیشنهاد هوش مصنوعی
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                        کاهش ۱۲٪ هزینه عملیاتی در فصل آینده
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/10 bg-[#0b1017]/90 p-4 shadow-xl backdrop-blur-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <Check size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">System Status</p>
                    <p className="text-sm font-semibold">AI Optimized</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 py-10 sm:grid-cols-4 lg:px-8">
          {[
            ["+40%", "افزایش بهره‌وری"],
            ["3.2x", "تصمیم‌گیری سریع‌تر"],
            ["24/7", "تحلیل هوشمند"],
            ["∞", "ظرفیت رشد"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="border-white/5 p-4 text-center first:border-0 sm:border-r"
            >
              <p className="text-2xl font-black text-white sm:text-3xl">
                {value}
              </p>
              <p className="mt-2 text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-8"
      >
        <SectionHeading
          eyebrow="SERVICES"
          title="مدیریت را هوشمندتر می‌کنیم."
          text="از استراتژی تا اجرا، Binex در کنار شماست تا فناوری را به یک مزیت واقعی برای کسب‌وکارتان تبدیل کند."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group rounded-3xl border border-white/8 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-cyan-400/[0.035]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 transition group-hover:bg-cyan-400 group-hover:text-black">
                  <Icon size={21} />
                </div>

                <h3 className="mt-7 text-lg font-bold">{service.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-500">
                  {service.text}
                </p>

                <div className="mt-7 flex items-center gap-2 text-xs text-zinc-600 transition group-hover:text-cyan-300">
                  بیشتر بدانید
                  <ChevronLeft size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* AI Section */}
      <section id="about" className="relative px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-cyan-400/[0.07] via-white/[0.02] to-blue-500/[0.05] p-8 sm:p-12 lg:p-16">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Network size={22} />
              </div>

              <p className="text-xs font-semibold tracking-[0.25em] text-cyan-300">
                AI × MANAGEMENT
              </p>

              <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
                هوش مصنوعی را از
                <br />
                <span className="text-zinc-500">ابزار، به مدیر تبدیل کنید.</span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-8 text-zinc-400">
                ما فقط ابزارهای AI معرفی نمی‌کنیم. هدف Binex ساخت یک سیستم
                مدیریتی است که داده‌ها را بفهمد، الگوها را شناسایی کند و به
                مدیران در تصمیم‌گیری کمک کند.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "تصمیم‌گیری مبتنی بر داده",
                  "اتوماسیون فرآیندهای مدیریتی",
                  "پایش مستمر عملکرد کسب‌وکار",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                      <Check size={13} />
                    </span>
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-[100px]" />

              <div className="relative mx-auto max-w-md rounded-[32px] border border-white/10 bg-[#070a0f]/90 p-5">
                <div className="rounded-[24px] border border-white/5 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-black">
                      <BrainCircuit size={21} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Binex Intelligence</p>
                      <p className="text-xs text-zinc-600">Active system</p>
                    </div>
                    <span className="mr-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                  </div>

                  <div className="my-7 h-px bg-white/5" />

                  <p className="text-xs text-zinc-500">
                    تحلیل وضعیت کسب‌وکار
                  </p>

                  <div className="mt-4 rounded-2xl bg-white/[0.025] p-5">
                    <p className="text-sm leading-7 text-zinc-300">
                      بر اساس داده‌های اخیر، پیشنهاد می‌شود منابع تیم فروش در
                      سه هفته آینده روی Segment B متمرکز شوند.
                    </p>

                    <div className="mt-5 flex items-center justify-between rounded-xl bg-cyan-400/[0.06] px-4 py-3">
                      <span className="text-xs text-zinc-500">
                        Confidence
                      </span>
                      <span className="text-sm font-bold text-cyan-300">
                        94.8%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section
        id="process"
        className="mx-auto max-w-7xl px-6 py-28 lg:px-8"
      >
        <SectionHeading
          eyebrow="OUR PROCESS"
          title="از مسئله تا نتیجه، کنار شما هستیم."
          text="یک مسیر ساده و شفاف برای تبدیل چالش‌های مدیریتی به راهکارهای قابل اجرا."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {process.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative border-t border-white/10 pt-7"
            >
              <span className="text-sm font-bold text-cyan-400">
                {item.number}
              </span>

              <h3 className="mt-4 text-xl font-bold">{item.title}</h3>

              <p className="mt-3 text-sm leading-7 text-zinc-500">
                {item.text}
              </p>

              {index !== process.length - 1 && (
                <ArrowUpLeft className="absolute left-0 top-7 hidden text-white/10 lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-6 pb-16 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-cyan-400/10 bg-cyan-400/[0.05] px-6 py-20 text-center">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />

          <div className="relative">
            <p className="text-xs font-semibold tracking-[0.3em] text-cyan-300">
              READY FOR THE NEXT STEP?
            </p>

            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              کسب‌وکار شما برای
              <br />
              <span className="text-cyan-300">هوشمند شدن</span> آماده است؟
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-zinc-500">
              برای بررسی فرصت‌های همکاری و دریافت مشاوره اولیه با تیم Binex
              در ارتباط باشید.
            </p>

            <a
              href="mailto:hello@binex.ir"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition hover:bg-cyan-300"
            >
              شروع یک گفت‌وگو
              <ArrowLeft size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="text-xl font-black tracking-[0.18em]">
              BINEX<span className="text-cyan-400">.</span>
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              Intelligent Management
            </p>
          </div>

          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Binex. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold tracking-[0.25em] text-cyan-300">
        {eyebrow}
      </p>

      <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
        {title}
      </h2>

      <p className="mt-5 text-sm leading-8 text-zinc-500">{text}</p>
    </div>
  );
}
