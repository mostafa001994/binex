export type Testimonial = {
  id: number;
  initial: string;
  name: string;
  company: string;
  location?: string;
  text: string;
  rating: number;
  featured?: boolean;
  avatarClassName: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 1,
    initial: "ر",
    name: "دکتر رضایی",
    company: "کلینیک اوج سلامت",
    text: "قبل از بینیکس روزی ۴ ساعت وقتم صرف جواب پیام‌های تکراری می‌شد. الان ربات همه رو جواب می‌ده و من فقط موارد خاص رو مدیریت می‌کنم.",
    rating: 5,
    avatarClassName: "from-[#0044CC] to-[#00AAFF]",
  },
  {
    id: 2,
    initial: "ن",
    name: "نیلوفر احمدی",
    company: "فروشگاه نیلوفر",
    location: "اصفهان",
    text: "فروش آنلاینمون ظرف ۳ ماه ۱.۸ برابر شد. فروشنده هوشمند بینیکس ۲۴ ساعته جواب می‌ده و حتی بهتر از بعضی پرسنل ما می‌فروشه!",
    rating: 5,
    featured: true,
    avatarClassName: "from-[#6600CC] to-[#0088FF]",
  },
  {
    id: 3,
    initial: "م",
    name: "محمد کریمی",
    company: "فناوری پردیس",
    location: "مشهد",
    text: "داشبورد BI که بینیکس ساخت رو قبلاً با اکسل دستی انجام می‌دادیم. الان مدیرمون لحظه‌ای وضعیت فروش رو می‌بینه.",
    rating: 4,
    avatarClassName: "from-[#005500] to-[#00AA55]",
  },
  {
    id: 4,
    initial: "م",
    name: "محمد کریمی",
    company: "فناوری پردیس",
    location: "مشهد",
    text: "داشبورد BI که بینیکس ساخت رو قبلاً با اکسل دستی انجام می‌دادیم. الان مدیرمون لحظه‌ای وضعیت فروش رو می‌بینه.",
    rating: 4,
    avatarClassName: "from-[#005500] to-[#00AA55]",
  },
  {
    id: 5,
    initial: "م",
    name: "محمد کریمی",
    company: "فناوری پردیس",
    location: "مشهد",
    text: "داشبورد BI که بینیکس ساخت رو قبلاً با اکسل دستی انجام می‌دادیم. الان مدیرمون لحظه‌ای وضعیت فروش رو می‌بینه.",
    rating: 4,
    avatarClassName: "from-[#005500] to-[#00AA55]",
  },
];