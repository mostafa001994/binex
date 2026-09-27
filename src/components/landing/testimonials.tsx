"use client";

import { testimonials } from "@/constants/testimonials-data";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type TestimonialsProps = {
  title?: string;
  badge?: string;
  className?: string;
};

export default function Testimonials({
  title = "صادقانه از زبان کسانی که استفاده کردند",
  badge = "نظر مشتریان",
  className = "",
}: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /* ---------------------------------
     Responsive cards count
  ---------------------------------- */
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();

    window.addEventListener(
      "resize",
      updateVisibleCount
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateVisibleCount
      );
    };
  }, []);

  const maxIndex = Math.max(
    testimonials.length - visibleCount,
    0
  );

  /* ---------------------------------
     Keep index valid after resize
  ---------------------------------- */
  useEffect(() => {
    setCurrentIndex((prev) =>
      Math.min(prev, maxIndex)
    );
  }, [maxIndex]);

  const visibleTestimonials = useMemo(() => {
    return testimonials.slice(
      currentIndex,
      currentIndex + visibleCount
    );
  }, [currentIndex, visibleCount]);

  /* ---------------------------------
     Navigation
  ---------------------------------- */
  const nextSlide = () => {
    setDirection(1);

    setCurrentIndex((prev) => {
      if (prev >= maxIndex) {
        return 0;
      }

      return prev + 1;
    });
  };

  const prevSlide = () => {
    setDirection(-1);

    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return maxIndex;
      }

      return prev - 1;
    });
  };

  const goToSlide = (index: number) => {
    setDirection(
      index > currentIndex ? 1 : -1
    );

    setCurrentIndex(index);
  };

  /* ---------------------------------
     Auto Slide
  ---------------------------------- */
  useEffect(() => {
    if (
      maxIndex <= 0 ||
      isPaused
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setDirection(1);

      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0;
        }

        return prev + 1;
      });
    }, 4000);

    return () => {
      window.clearInterval(interval);
    };
  }, [maxIndex, isPaused]);

  return (
    <section
      dir="rtl"
      className={`
        relative
        overflow-hidden
        px-4
        py-16
        sm:px-6
        sm:py-20
        lg:px-8
        lg:py-24
        ${className}
      `}
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Heading */}
        <div
          className="
            mb-9
            flex
            flex-col
            items-center
            text-center
            sm:mb-11
          "
        >
          <span
            className="
              text-sm
              font-medium
              text-cyan-400/80
            "
          >
            {badge}
          </span>

          <h2
            className="
              font-morabba
              mt-2
              max-w-[700px]
              text-2xl
              font-bold
              leading-relaxed
              text-white
              sm:text-3xl
              lg:text-4xl
            "
          >
            {title}
          </h2>
        </div>

        {/* Slider header */}
        <div
          className="
            mb-5
            flex
            items-center
            justify-between
          "
        >
          <div className="text-xs text-white/30">
            {/* تجربه مشتریان بینیکس */}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="نظر قبلی"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.035]
                text-white/70
                transition
                hover:border-cyan-400/30
                hover:bg-cyan-400/[0.08]
                hover:text-white
              "
            >
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="نظر بعدی"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.035]
                text-white/70
                transition
                hover:border-cyan-400/30
                hover:bg-cyan-400/[0.08]
                hover:text-white
              "
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() =>
            setIsPaused(true)
          }
          onMouseLeave={() =>
            setIsPaused(false)
          }
          onTouchStart={() =>
            setIsPaused(true)
          }
          onTouchEnd={() =>
            setIsPaused(false)
          }
        >
          <motion.div
            drag="x"
            dragConstraints={{
              left: 0,
              right: 0,
            }}
            dragElastic={0.12}
            onDragStart={() =>
              setIsPaused(true)
            }
            onDragEnd={(_, info) => {
              const threshold = 60;

              if (
                info.offset.x < -threshold
              ) {
                prevSlide();
              }

              if (
                info.offset.x > threshold
              ) {
                nextSlide();
              }

              setIsPaused(false);
            }}
            className="
              cursor-grab
              touch-pan-y
              active:cursor-grabbing
            "
          >
            <AnimatePresence
              initial={false}
              mode="popLayout"
            >
              <motion.div
                key={`${currentIndex}-${visibleCount}`}
                initial={{
                  opacity: 0,
                  x:
                    direction > 0
                      ? -35
                      : 35,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x:
                    direction > 0
                      ? 35
                      : -35,
                }}
                transition={{
                  duration: 0.32,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                className="
                  grid
                  grid-cols-1
                  gap-3.5
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {visibleTestimonials.map(
                  (
                    testimonial,
                    index
                  ) => (
                    <TestimonialCard
                      key={
                        testimonial.id
                      }
                      testimonial={
                        testimonial
                      }
                      index={index}
                    />
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Pagination */}
        {maxIndex > 0 && (
          <div
            className="
              mt-7
              flex
              items-center
              justify-center
              gap-2
            "
          >
            {Array.from({
              length: maxIndex + 1,
            }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  goToSlide(index)
                }
                aria-label={`اسلاید ${index + 1}`}
                className={`
                  h-[6px]
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    currentIndex ===
                    index
                      ? "w-7 bg-cyan-400"
                      : "w-[6px] bg-white/20 hover:bg-white/40"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   Testimonial Card
========================================================= */

type TestimonialCardProps = {
  testimonial: (typeof testimonials)[number];
  index: number;
};

function TestimonialCard({
  testimonial,
  index,
}: TestimonialCardProps) {
  const {
    initial,
    name,
    company,
    location,
    text,
    rating,
    featured,
    avatarClassName,
  } = testimonial;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
      }}
      whileHover={{
        y: -4,
      }}
      className={[
        "relative",
        "flex",
        "h-full",
        "flex-col",
        "rounded-[18px]",
        "p-5",
        "sm:p-6",
        "backdrop-blur-xl",
        "transition-colors",
        featured
          ? `
            border-[1.5px]
            border-cyan-400/30
            bg-[rgba(0,45,150,0.20)]
            shadow-[0_15px_45px_rgba(0,100,255,0.08)]
          `
          : `
            border
            border-white/[0.06]
            bg-white/[0.025]
            hover:border-white/[0.10]
            hover:bg-white/[0.035]
          `,
      ].join(" ")}
    >
      {/* Featured badge */}
      {/* {featured && (
        <div
          className="
            absolute
            -top-2.5
            right-1/2
            translate-x-1/2
            whitespace-nowrap
            rounded-full
            bg-gradient-to-r
            from-[#0055EE]
            to-[#00C2FF]
            px-3
            py-1
            text-[11px]
            font-bold
            text-white
            sm:text-[12px]
          "
        >
          محبوب‌ترین
        </div>
      )} */}

      {/* Quote */}
      <div
        className="
          mb-2
          text-[28px]
          leading-none
          text-cyan-300/80
        "
      >
        “
      </div>

      {/* Text */}
      <p
        className="
          mb-5
          flex-1
          text-[14px]
          leading-[2]
          text-[rgba(180,220,255,0.70)]
          sm:text-[15px]
        "
      >
        {text}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2.5">
        {/* Avatar */}
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-gradient-to-br
            ${avatarClassName}
            text-[12px]
            font-bold
            text-white
          `}
        >
          {initial}
        </div>

        {/* User info */}
        <div className="min-w-0">
          <div
            className="
              truncate
              text-[13px]
              font-bold
              text-[#DDF0FF]
              sm:text-[14px]
            "
          >
            {name}
          </div>

          <div
            className="
              mt-0.5
              truncate
              text-[11px]
              text-[rgba(150,200,255,0.70)]
              sm:text-[12px]
            "
          >
            {company}

            {location &&
              ` — ${location}`}
          </div>
        </div>

        {/* Rating */}
        <div
          className="
            mr-auto
            shrink-0
            text-[9px]
            tracking-[1px]
            text-[#FFB800]
            sm:text-[10px]
          "
          aria-label={`امتیاز ${rating} از 5`}
        >
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </div>
      </div>
    </motion.article>
  );
}