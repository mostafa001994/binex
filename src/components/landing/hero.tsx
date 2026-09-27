"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Background from "./background";
import Image from "next/image";

type DemoOption = {
    label: string;
    response: React.ReactNode;
};

type ChatStage =
    | "idle"
    | "typingResponse"
    | "response"
    | "typingPhone"
    | "phoneRequest"
    | "input"
    | "saving"
    | "saved";

const demoOptions: DemoOption[] = [
    {
        label: "🤖 فروشنده هوشمند",
        response: (
            <>
                فروشنده هوشمند Binix برای پاسخ‌گویی، معرفی محصول و همراهی
                مشتری در مسیر سفارش طراحی شده است.
                <br />
                <br />
                ✅ پاسخ بر اساس اطلاعات کسب‌وکار
                <br />
                ✅ معرفی و پیشنهاد محصول
                <br />
                ✅ هدایت به سفارش یا اپراتور
                <br />
                <br />
                این سرویس اکنون آماده نمایش دمو است.
            </>
        ),
    },
    {
        label: "📅 رزرو آنلاین هوشمند",
        response: (
            <>
                رزرو نوبت هوشمند برای مدیریت خدمات، ظرفیت و زمان‌های کاری
                کسب‌وکارهای نوبت‌محور طراحی می‌شود.
                <br />
                <br />
                ✅ ثبت و مدیریت درخواست رزرو
                <br />
                ✅ برنامه‌ریزی یادآوری‌ها
                <br />
                ✅ مدیریت زمان
                <br />
                <br />
                این سرویس هنوز در حال توسعه است و می‌توانید نیازتان را ثبت کنید.
            </>
        ),
    },
    {
        label: "📊 تحلیلگر اکسل",
        response: (
            <>
                تحلیلگر اکسل برای بررسی کیفیت داده و آماده‌سازی گزارش‌های
                مدیریتی از فایل‌های کسب‌وکار طراحی می‌شود.
                <br />
                <br />
                ✅ بررسی ساختار و کیفیت داده
                <br />
                ✅ آماده‌سازی گزارش مدیریتی
                <br />
                ✅ شناسایی الگوها و مشکلات
                <br />
                <br />
                این سرویس هنوز در حال توسعه است.
            </>
        ),
    },
    {
        label: "🧩 ماژول‌های BI",
        response: (
            <>
                ماژول‌های BI برای تبدیل داده‌های کسب‌وکار به داشبوردها و
                گزارش‌های مدیریتی در نقشه راه Binix قرار دارند.
                <br />
                <br />
                ✅ داشبورد مدیریتی
                <br />
                ✅ تعریف شاخص‌های مدیریتی
                <br />
                ✅ تصمیم‌گیری داده‌محور
                <br />
                <br />
                اکنون می‌توانید نیاز BI کسب‌وکارتان را ثبت کنید.
            </>
        ),
    },
];

export default function Hero() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [selectedOption, setSelectedOption] = useState<number | null>(
        null
    );

    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const [stage, setStage] = useState<ChatStage>("idle");

    /* ---------------------------------------------------------------------- */
    /* Current Time                                                           */
    /* ---------------------------------------------------------------------- */

    const [currentTime, setCurrentTime] = useState("--:--");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();

            const time = new Intl.DateTimeFormat("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }).format(now);

            setCurrentTime(time);
        };

        updateTime();

        const interval = window.setInterval(updateTime, 1000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Network Background                                                     */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const context = canvas.getContext("2d");

        if (!context) return;

        let animationFrame = 0;

        let width = 0;
        let height = 0;

        type Node = {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
        };

        let nodes: Node[] = [];

        const resize = () => {
            const rect = canvas.getBoundingClientRect();

            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            width = rect.width;
            height = rect.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(
                50,
                Math.max(20, Math.floor(width / 25))
            );

            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                radius: Math.random() * 1.3 + 0.5,
            }));
        };

        const animate = () => {
            context.clearRect(0, 0, width, height);

            nodes.forEach((node) => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x <= 0 || node.x >= width) {
                    node.vx *= -1;
                }

                if (node.y <= 0 || node.y >= height) {
                    node.vy *= -1;
                }
            });

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];

                    const dx = a.x - b.x;
                    const dy = a.y - b.y;

                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 125) {
                        const opacity =
                            (1 - distance / 125) * 0.12;

                        context.beginPath();
                        context.moveTo(a.x, a.y);
                        context.lineTo(b.x, b.y);

                        context.strokeStyle = `rgba(0,120,220,${opacity})`;
                        context.lineWidth = 0.7;
                        context.stroke();
                    }
                }
            }

            nodes.forEach((node) => {
                context.beginPath();

                context.arc(
                    node.x,
                    node.y,
                    node.radius,
                    0,
                    Math.PI * 2
                );

                context.fillStyle = "rgba(0,150,230,0.25)";
                context.fill();
            });

            animationFrame = requestAnimationFrame(animate);
        };

        resize();
        animate();

        window.addEventListener("resize", resize);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", resize);
        };
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Demo                                                                   */
    /* ---------------------------------------------------------------------- */

    const handleDemoOption = (index: number) => {
        setSelectedOption(index);
        setPhone("");
        setPhoneError("");

        setStage("typingResponse");

        window.setTimeout(() => {
            setStage("response");

            window.setTimeout(() => {
                setStage("typingPhone");

                window.setTimeout(() => {
                    setStage("phoneRequest");

                    window.setTimeout(() => {
                        setStage("input");
                    }, 550);
                }, 950);
            }, 900);
        }, 900);
    };

    const handleBack = () => {
        setSelectedOption(null);
        setPhone("");
        setPhoneError("");
        setStage("idle");
    };
    const handlePhoneSubmit = async () => {
        const normalizedPhone = phone.replace(
            /\s|-/g,
            ""
        );

        if (!/^09\d{9}$/.test(normalizedPhone)) {
            setPhoneError(
                "لطفاً یک شماره موبایل معتبر وارد کنید."
            );

            return;
        }

        if (selectedOption === null) return;

        setPhoneError("");
        setStage("saving");

        try {
            const response = await fetch(
                "/api/leads",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        phone: normalizedPhone,
                        product:
                            demoOptions[selectedOption].label,
                        source: "homepage-assistant",
                        consent: true,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "خطا در ثبت شماره موبایل"
                );
            }

            // اختیاری: نگهداری نسخه محلی همزمان
            localStorage.setItem(
                "binix-demo-phone",
                normalizedPhone
            );

            localStorage.setItem(
                "binix-demo-product",
                demoOptions[selectedOption].label
            );
            setStage("saved");
        } catch (error) {
            console.error(error);

            setStage("input");

            setPhoneError(
                "ثبت شماره انجام نشد. لطفاً دوباره تلاش کنید."
            );
        }
    };
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    const isTyping =
        stage === "typingResponse" ||
        stage === "typingPhone" ||
        stage === "saving";

    const showBackButton =
        selectedOption !== null &&
        (stage === "typingPhone" ||
            stage === "phoneRequest" ||
            stage === "input" ||
            stage === "saving" ||
            stage === "saved");

    return (
        <section
            dir="rtl"
            className="
    relative
    isolate
    overflow-hidden
    bg-transparent
    px-4
    py-14
    sm:px-6
    sm:py-16
    md:px-8
    md:py-20
    lg:px-10
    lg:py-24
  "
        >
            <Background />
            {/* Network background */}

            <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    h-full
                    w-full
                    opacity-50
                "
            />

            {/* Glow */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    -left-[5%]
                    -top-[15%]
                    h-[280px]
                    w-[280px]
                    rounded-full
                    bg-[radial-gradient(circle,rgba(0,70,220,0.1)_0%,transparent_70%)]
                    sm:h-[340px]
                    sm:w-[340px]
                    md:h-[400px]
                    md:w-[400px]
                "
            />

            {/* Content */}

            <div
                className="
                    relative
                    mx-auto
                    flex
                    flex-col
                    lg:flex-row
                    max-w-[1280px]
                    flex-wrap
                    items-center
                    gap-8
                    sm:gap-10
                    md:gap-12
                    lg:gap-16
                "
            >
                {/* Hero content */}

                <motion.div
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="
                        min-w-0
                        flex-[1_1_260px]
                        text-center
                        sm:text-center
                        lg:text-right
                    "
                >
                    {/* Badge */}

                    <div
                        className="
                            mb-5
                            inline-flex
                            items-center
                            gap-[7px]
                            rounded-full
                            border
                            border-accent/25
                            bg-accent/10
                            px-3
                            py-1.5
                            sm:px-[14px]
                            sm:py-1
                        "
                    >
                        <span
                            className="
                                h-[6px]
                                w-[6px]
                                animate-pulse
                                rounded-full
                                bg-accent
                            "
                        />

                        <span
                            className="
                                text-[12px]
                                text-accent
                                sm:text-[13px]
                                md:text-sm
                            "
                        >
                            دستیارهای هوشمند برای کسب‌وکارهای ایرانی
                        </span>
                    </div>

                    {/* Title */}

                    <h1
                        className="
                        font-morabba
                            mb-[13px]
                            text-[clamp(1.9rem,7vw,2.5rem)]
                            font-black
                            leading-[1.35]
                            text-white
                            sm:text-[clamp(2rem,5vw,2.7rem)]
                            md:text-[clamp(2.2rem,4vw,3rem)]
                            lg:text-[clamp(2.3rem,3.5vw,3.2rem)]
                        "
                    >
                        دستیارهای هوشمند برای
                        <br />

                        <span
                            className="
                                bg-gradient-to-r
                                from-accent
                                to-primary
                                bg-clip-text
                                text-transparent
                            "
                        >
                            فروش و مدیریت بهتر
                        </span>{" "}
                        کسب‌وکار شما
                    </h1>

                    {/* Description */}

                    <p
                        className="
                            mx-auto
                            mb-0
                            max-w-[520px]
                            leading-[2]
                            text-[14px]
                            text-marketing-text-muted
                            sm:text-[15px]
                            md:text-base
                            lg:mx-0
                        "
                    >
                        Binix فرایندهای تکراری کسب‌وکارتان را با سرویس‌های
                        هوشمند انجام می‌دهد؛ از پاسخ‌گویی و فروش در پیام‌رسان
                        تا رزرو نوبت، تحلیل فایل‌های اکسل و گزارش‌های مدیریتی.
                    </p>

                    <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                        <a
                            href="#consultation"
                            className="
                                inline-flex
                                h-11
                                items-center
                                justify-center
                                rounded-[10px]
                                bg-gradient-to-l
                                from-primary
                                to-accent
                                px-5
                                text-[13px]
                                font-bold
                                text-white
                                shadow-[0_10px_30px_rgba(7,139,255,.20)]
                                transition
                                hover:-translate-y-0.5
                                hover:shadow-[0_14px_38px_rgba(7,139,255,.28)]
                            "
                        >
                            درخواست مشاوره رایگان
                        </a>

                        <a
                            href="#products"
                            className="
                                inline-flex
                                h-11
                                items-center
                                justify-center
                                rounded-[10px]
                                border
                                border-white/[0.10]
                                bg-white/[0.035]
                                px-5
                                text-[13px]
                                font-semibold
                                text-marketing-text
                                transition
                                hover:border-white/[0.18]
                                hover:bg-white/[0.06]
                            "
                        >
                            مشاهده سرویس‌ها
                        </a>
                    </div>

                    <p className="font-ui mx-auto mt-4 max-w-[520px] text-[11px] leading-6 text-marketing-text-subtle lg:mx-0">
                        برای شروع لازم نیست همه‌چیز را تغییر دهید؛ ابتدا مناسب‌ترین نقطه برای هوشمندسازی کسب‌وکارتان را پیدا می‌کنیم.
                    </p>

                </motion.div>

                {/* Telegram Demo */}

                <motion.div
                    id="ds"
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.6,
                        delay: 0.15,
                    }}
                    className="
                        relative
                        w-full
                        min-w-0
                        flex-1
                        z-10
                    "
                >
                    {/* Mobile */}

                    <div
                        className="
                            mx-auto
                            flex
                            h-[600px]
                            w-full
                            max-w-[410px]
                            min-w-0
                            flex-col
                            overflow-hidden
                            rounded-[18px]
                            border
                            border-[#d7dce0]
                            bg-white
                            shadow-[0_25px_80px_rgba(0,0,0,0.22)]
                        "
                        style={{
                            fontFamily: "Vazir, sans-serif",
                        }}
                    >
                        {/* Telegram Header */}

                        <div
                            className="
                                relative
                                shrink-0
                                border-b
                                border-[#e1e5e8]
                                bg-white
                                shadow-[0_1px_3px_rgba(0,0,0,0.08)]
                            "
                        >
                            {/* Real Status Bar */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    px-5
                                    pt-3
                                    text-[9px]
                                    font-medium
                                    text-[#707579]
                                    sm:text-[10px]
                                "
                                dir="ltr"
                            >
                                <span dir="ltr">
                                    {currentTime}
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <span>5G</span>

                                    <span
                                        className="
                                            h-2.5
                                            w-4
                                            rounded-[2px]
                                            border
                                            border-[#707579]
                                            p-[1px]
                                        "
                                    >
                                        <span
                                            className="
                                                block
                                                h-full
                                                w-full
                                                rounded-[1px]
                                                bg-[#707579]
                                            "
                                        />
                                    </span>
                                </div>
                            </div>

                            {/* Header */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    sm:px-5
                                    sm:py-3.5
                                "
                            >
                                {/* Back */}

                                <button
                                    type="button"
                                    aria-label="بازگشت"
                                    onClick={
                                        showBackButton
                                            ? handleBack
                                            : undefined
                                    }
                                    className={`
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        text-[22px]
                                        text-[#3390ec]
                                        transition
                                        ${showBackButton
                                            ? "hover:bg-[#f0f2f5] active:scale-90"
                                            : "pointer-events-none opacity-0"
                                        }
                                    `}
                                >
                                    →
                                </button>

                                {/* Avatar */}

                                {/* Avatar */}
                                <div
                                    className="
    relative
    h-11
    w-11
    shrink-0
    sm:h-12
    sm:w-12
    rounded-full
  "
                                >
                                    <div
                                        className="
      relative
      z-10
      flex
      h-full
      w-full
      items-center
      justify-center
      overflow-hidden
      rounded-full
    "
                                    >
                                        <Image
                                            src="/img/Binix-Logo.png"
                                            alt="Binix"
                                            width={48}
                                            height={48}
                                            className="
        h-full
        w-full
        object-contain
        p-1.5
      "
                                        />
                                    </div>

                                    <span
                                        className="
      absolute
      bottom-0
      left-0
      z-50
      h-2
      w-2
      rounded-full
      bg-[#4caf50]
    "
                                    />
                                </div>

                                {/* Name */}

                                <div className="min-w-0 flex-1">
                                    <div
                                        className="
                                            truncate
                                            text-[14px]
                                            font-semibold
                                            text-[#222]
                                            sm:text-[15px]
                                        "
                                    >
                                        دستیار هوشمند بینیکس
                                    </div>

                                    <div
                                        className="
                                            mt-0.5
                                            text-[11px]
                                            text-[#707579]
                                            sm:text-[12px]
                                        "
                                    >
                                        {isTyping
                                            ? "در حال نوشتن..."
                                            : "آنلاین"}
                                    </div>
                                </div>

                                {/* Menu */}

                                <button
                                    type="button"
                                    aria-label="منو"
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        text-[22px]
                                        text-[#707579]
                                        transition
                                        hover:bg-[#f0f2f5]
                                    "
                                >
                                    ⋮
                                </button>
                            </div>
                        </div>

                        {/* Chat */}

                        <div
                            className="
                                relative
                                min-h-0
                                flex-1
                                overflow-y-auto
                                overflow-x-hidden
                                bg-[#e7ebee]
                                px-3
                                py-4
                                sm:px-4
                                sm:py-5

                                [scrollbar-width:thin]
                                [scrollbar-color:#3390ec_#dfe7ee]

                                [&::-webkit-scrollbar]:w-[6px]
                                [&::-webkit-scrollbar-track]:bg-[#dfe7ee]
                                [&::-webkit-scrollbar-thumb]:rounded-full
                                [&::-webkit-scrollbar-thumb]:bg-[#3390ec]
                                [&::-webkit-scrollbar-thumb:hover]:bg-[#227bc8]
                            "
                        >
                            {/* Telegram wallpaper */}

                            <div
                                aria-hidden="true"
                                className="
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    opacity-[0.18]

                                    [background-color:#dfe7ec]

                                    [background-image:
                                        radial-gradient(circle_at_15%_15%,rgba(120,140,150,0.45)_1px,transparent_1.5px),
                                        radial-gradient(circle_at_75%_20%,rgba(120,140,150,0.35)_1px,transparent_1.5px),
                                        radial-gradient(circle_at_35%_55%,rgba(120,140,150,0.35)_1px,transparent_1.5px),
                                        radial-gradient(circle_at_85%_70%,rgba(120,140,150,0.4)_1px,transparent_1.5px),
                                        radial-gradient(circle_at_20%_85%,rgba(120,140,150,0.3)_1px,transparent_1.5px)
                                    ]

                                    [background-size:
                                        70px_70px,
                                        90px_90px,
                                        110px_110px,
                                        85px_85px,
                                        100px_100px
                                    ]

                                    [background-position:
                                        0_0,
                                        25px_15px,
                                        45px_35px,
                                        10px_60px,
                                        60px_20px
                                    ]
                                "
                            />

                            <div className="relative">
                                {/* Initial */}

                                {selectedOption === null && (
                                    <BotMessage>
                                        <>
                                            سلام! من دستیار هوشمند بینیکسم 👋
                                            <br />
                                            چطور می‌تونم کمکتون کنم؟
                                        </>
                                    </BotMessage>
                                )}

                                {/* Conversation */}

                                {selectedOption !== null && (
                                    <>
                                        <UserMessage>
                                            {
                                                demoOptions[
                                                    selectedOption
                                                ].label
                                            }
                                        </UserMessage>

                                        {stage === "typingResponse" && (
                                            <TypingMessage />
                                        )}

                                        {(stage === "response" ||
                                            stage === "typingPhone" ||
                                            stage === "phoneRequest" ||
                                            stage === "input" ||
                                            stage === "saving" ||
                                            stage === "saved") && (
                                                <BotMessage large>
                                                    {
                                                        demoOptions[
                                                            selectedOption
                                                        ].response
                                                    }
                                                </BotMessage>
                                            )}

                                        {stage === "typingPhone" && (
                                            <TypingMessage />
                                        )}

                                        {(stage === "phoneRequest" ||
                                            stage === "input" ||
                                            stage === "saving" ||
                                            stage === "saved") && (
                                                <BotMessage>
                                                    <>
                                                        اگر مایل باشید اطلاعات
                                                        کامل‌تر و هماهنگی دمو رو
                                                        براتون انجام بدیم.
                                                        <br />
                                                        <br />
                                                        📱 لطفاً شماره موبایلتون رو
                                                        ارسال کنید.
                                                    </>
                                                </BotMessage>
                                            )}

                                        {stage === "saving" && (
                                            <TypingMessage />
                                        )}

                                        {(stage === "saving" ||
                                            stage === "saved") &&
                                            phone && (
                                                <UserMessage>
                                                    <span dir="ltr">
                                                        {phone}
                                                    </span>
                                                </UserMessage>
                                            )}

                                        {stage === "saved" && (
                                            <BotMessage>
                                                <>
                                                    شماره موبایلت با موفقیت ثبت
                                                    شد. ✅
                                                    <br />
                                                    <br />
                                                    کارشناسان بینیکس برای ارائه
                                                    اطلاعات بیشتر با شما تماس
                                                    می‌گیرند.
                                                </>
                                            </BotMessage>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Composer */}

                        <div
                            className="
                                shrink-0
                                border-t
                                border-[#dfe3e6]
                                bg-white
                                p-2.5
                                sm:p-3
                            "
                        >
                            {selectedOption === null ? (
                                <>
                                    <div
                                        className="
                                            mb-2
                                            px-1
                                            text-[11px]
                                            text-[#707579]
                                            sm:text-[12px]
                                        "
                                    >
                                        برای شروع یک گزینه را انتخاب کنید:
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        {demoOptions.map(
                                            (option, index) => (
                                                <button
                                                    key={option.label}
                                                    type="button"
                                                    onClick={() =>
                                                        handleDemoOption(
                                                            index
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        min-h-[42px]
                                                        w-full
                                                        items-center
                                                        rounded-[10px]
                                                        border
                                                        border-[#dfe3e6]
                                                        bg-[#f5f7f8]
                                                        px-3
                                                        py-2
                                                        text-right
                                                        text-[12.5px]
                                                        font-medium
                                                        leading-6
                                                        text-[#222]
                                                        transition
                                                        hover:border-[#cbd1d5]
                                                        hover:bg-[#edf0f2]
                                                        active:scale-[0.99]
                                                        sm:min-h-[44px]
                                                        sm:text-[13px]
                                                    "
                                                >
                                                    {option.label}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </>
                            ) : stage === "saved" ? (
                                <button
                                    type="button"
                                    onClick={() => scrollTo("cta")}
                                    className="
                                        min-h-[44px]
                                        w-full
                                        rounded-[10px]
                                        bg-[#3390ec]
                                        px-4
                                        py-2.5
                                        text-[13px]
                                        font-semibold
                                        text-white
                                        shadow-[0_3px_10px_rgba(51,144,236,0.2)]
                                        transition
                                        hover:bg-[#2b83d5]
                                        active:scale-[0.99]
                                        sm:text-[14px]
                                    "
                                >
                                    مشاوره رایگان رزرو کن ←
                                </button>
                            ) : stage === "input" ? (
                                <PhoneComposer
                                    phone={phone}
                                    setPhone={(value) => {
                                        setPhone(value);
                                        setPhoneError("");
                                    }}
                                    error={phoneError}
                                    onSubmit={handlePhoneSubmit}
                                />
                            ) : (
                                <div
                                    className="
                                        flex
                                        min-h-[44px]
                                        items-center
                                        justify-center
                                        rounded-[10px]
                                        bg-[#f0f2f5]
                                        text-[11px]
                                        text-[#8797a5]
                                    "
                                >
                                    <span className="animate-pulse">
                                        در حال نوشتن...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Telegram Bot Message                                                       */
/* -------------------------------------------------------------------------- */

function BotMessage({
    children,
    large = false,
}: {
    children: React.ReactNode;
    large?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`
                relative
                mb-2
                w-fit
                max-w-[92%]
                rounded-[10px]
                rounded-bl-[3px]
                bg-white
                px-3
                py-2.5
                text-[12.5px]
                leading-[1.85]
                text-[#222]
                shadow-[0_1px_2px_rgba(0,0,0,0.14)]
                sm:px-3.5
                sm:py-3
                sm:text-[13px]
                ${large
                    ? "sm:text-[13.5px] md:text-[14px]"
                    : ""
                }
            `}
        >
            {children}

            {/* Bubble tail */}

            <span
                aria-hidden="true"
                className="
                    absolute
                    bottom-0
                    left-[-5px]
                    h-3
                    w-3
                    overflow-hidden
                "
            >
                <span
                    className="
                        absolute
                        bottom-0
                        left-0
                        h-3
                        w-3
                        rotate-45
                        bg-white
                    "
                />
            </span>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/* Telegram User Message                                                      */
/* -------------------------------------------------------------------------- */

function UserMessage({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="
                relative
                mb-2
                ml-auto
                w-fit
                max-w-[82%]
                rounded-[10px]
                rounded-br-[3px]
                bg-[#effdde]
                px-3
                py-2.5
                text-[12.5px]
                leading-[1.7]
                text-[#222]
                shadow-[0_1px_2px_rgba(0,0,0,0.12)]
                sm:px-3.5
                sm:py-3
                sm:text-[13px]
            "
        >
            {children}

            {/* Bubble tail */}

            <span
                aria-hidden="true"
                className="
                    absolute
                    bottom-0
                    right-[-5px]
                    h-3
                    w-3
                    overflow-hidden
                "
            >
                <span
                    className="
                        absolute
                        bottom-0
                        right-0
                        h-3
                        w-3
                        rotate-45
                        bg-[#effdde]
                    "
                />
            </span>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/* Typing                                                                     */
/* -------------------------------------------------------------------------- */

function TypingMessage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="
                relative
                mb-2
                flex
                w-fit
                items-center
                gap-1
                rounded-[10px]
                rounded-bl-[3px]
                bg-white
                px-3.5
                py-3
                shadow-[0_1px_2px_rgba(0,0,0,0.12)]
            "
        >
            <span
                className="
                    h-1.5
                    w-1.5
                    animate-bounce
                    rounded-full
                    bg-[#8b959e]
                "
            />

            <span
                className="
                    h-1.5
                    w-1.5
                    animate-bounce
                    rounded-full
                    bg-[#8b959e]
                    [animation-delay:150ms]
                "
            />

            <span
                className="
                    h-1.5
                    w-1.5
                    animate-bounce
                    rounded-full
                    bg-[#8b959e]
                    [animation-delay:300ms]
                "
            />

            <span
                aria-hidden="true"
                className="
                    absolute
                    bottom-0
                    left-[-5px]
                    h-3
                    w-3
                "
            />
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/* Phone Composer                                                             */
/* -------------------------------------------------------------------------- */

function PhoneComposer({
    phone,
    setPhone,
    error,
    onSubmit,
}: {
    phone: string;
    setPhone: (value: string) => void;
    error: string;
    onSubmit: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full"
        >
            <div
                className="
                    flex
                    min-h-[46px]
                    items-center
                    gap-2
                    rounded-[22px]
                    bg-[#f0f2f5]
                    px-2
                    py-1.5
                "
            >
                {/* Attachment */}

                <button
                    type="button"
                    aria-label="پیوست"
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        text-[22px]
                        text-[#707579]
                        transition
                        hover:bg-[#e5e8eb]
                    "
                >
                    +
                </button>

                {/* Input */}

                <input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={11}
                    autoFocus
                    value={phone}
                    onChange={(event) => {
                        setPhone(
                            event.target.value.replace(/\D/g, "")
                        );
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            onSubmit();
                        }
                    }}
                    placeholder="شماره موبایل..."
                    className="
                        min-w-0
                        flex-1
                        bg-transparent
                        px-1
                        text-left
                        text-[13px]
                        text-[#222]
                        outline-none
                        placeholder:text-[#9aa3aa]
                        sm:text-[13.5px]
                    "
                />

                {/* Send */}

                <button
                    type="button"
                    onClick={onSubmit}
                    aria-label="ارسال شماره موبایل"
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#3390ec]
                        text-[18px]
                        font-bold
                        text-white
                        transition
                        hover:bg-[#2b83d5]
                        active:scale-90
                    "
                >
                    ←
                </button>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="
                        mt-1.5
                        px-2
                        text-[11px]
                        leading-5
                        text-[#e53935]
                    "
                >
                    {error}
                </motion.div>
            )}

            <p className="mt-1.5 px-2 text-[10px] leading-5 text-[#70808e]">
                با ارسال شماره، با تماس تیم Binix برای بررسی نیاز کسب‌وکارتان موافقت می‌کنید.
            </p>
        </motion.div>
    );
}
