import { HelpCircle } from "lucide-react";

const questions = [
  {
    question: "نوبت‌دهی هوشمند برای چه کسب‌وکارهایی مناسب است؟",
    answer:
      "برای کسب‌وکارهایی که خدمت آن‌ها به زمان، ظرفیت یا برنامه فرد ارائه‌دهنده وابسته است؛ از کلینیک و سالن تا آموزش، مشاوره و خدمات حضوری.",
  },
  {
    question: "ساعت کاری و روزهای تعطیل قابل تنظیم هستند؟",
    answer:
      "بله. ساعات کاری، بازه‌های غیرقابل رزرو، تعطیلی و محدودیت ظرفیت جزو قوانین پایه راه‌اندازی هستند.",
  },
  {
    question: "اگر مشتری بخواهد نوبتش را تغییر دهد چه می‌شود؟",
    answer:
      "قواعد لغو و جابه‌جایی در زمان راه‌اندازی مشخص می‌شوند تا تغییرات بدون به‌هم‌ریختن برنامه روزانه مدیریت شوند.",
  },
  {
    question: "برای شروع چه اطلاعاتی لازم است؟",
    answer:
      "فهرست خدمات، مدت تقریبی هر خدمت، ساعات کاری، ظرفیت و روش فعلی ثبت نوبت برای بررسی اولیه کافی است.",
  },
  {
    question: "آیا برای درخواست بررسی باید حساب Binix داشته باشم؟",
    answer:
      "خیر. ابتدا فرم کوتاه همین صفحه را ثبت کنید؛ ساخت حساب و تنظیمات اجرایی در ادامه مسیر انجام می‌شود.",
  },
];

export default function BookingFaq() {
  return (
    <section dir="rtl" className="relative overflow-hidden bg-marketing-background px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto grid max-w-[1040px] gap-10 lg:grid-cols-[.68fr_1.32fr]">
        <div>
          <div className="font-ui inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
            <HelpCircle size={14} /> پرسش‌های پرتکرار
          </div>
          <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
            قبل از درخواست، پاسخ سؤال‌های اصلی را ببینید
          </h2>
          <p className="font-ui mt-4 text-[12.5px] leading-7 text-marketing-text-muted">
            جزئیات نهایی هر راه‌اندازی بر اساس نوع خدمت و برنامه کاری شما مشخص می‌شود.
          </p>
        </div>

        <div className="space-y-3">
          {questions.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group rounded-card border border-marketing-border bg-marketing-surface/60 p-5"
            >
              <summary className="font-display cursor-pointer list-none text-sm font-bold text-marketing-text marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="font-ui text-lg font-normal text-service-accent transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="font-ui mt-4 border-t border-marketing-border pt-4 text-[11.5px] leading-7 text-marketing-text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

