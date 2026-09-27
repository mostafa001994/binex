export type ServiceMarketingItem = {
  title: string;
  description: string;
};

export type ServiceMarketingFaq = {
  question: string;
  answer: string;
};

export type ServiceMarketingContent = {
  version: 1;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    imageUrl: string;
    imageAlt: string;
  };
  benefits: ServiceMarketingItem[];
  steps: ServiceMarketingItem[];
  trust: {
    title: string;
    description: string;
    items: string[];
  };
  faq: ServiceMarketingFaq[];
  cta: {
    title: string;
    description: string;
    label: string;
    href: string;
  };
};

export type ServiceMarketingFallback = {
  name: string;
  category: string;
  description: string;
  features: string[];
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringList(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return [...fallback];
  return value
    .map((item) => text(item))
    .filter(Boolean)
    .slice(0, 12);
}

function itemList(value: unknown, fallback: ServiceMarketingItem[]) {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .map((item) => {
      const source = record(item);
      return {
        title: text(source.title),
        description: text(source.description),
      };
    })
    .filter((item) => item.title && item.description)
    .slice(0, 12);

  return items.length ? items : fallback;
}

export function createDefaultServiceMarketingContent(
  fallback: ServiceMarketingFallback,
): ServiceMarketingContent {
  const benefits = fallback.features.map((feature) => ({
    title: feature,
    description: `این قابلیت در ${fallback.name} برای ساده‌تر و سریع‌تر شدن فرایند شما در نظر گرفته شده است.`,
  }));

  return {
    version: 1,
    hero: {
      eyebrow: fallback.category,
      title: fallback.name,
      description: fallback.description,
      primaryCtaLabel: "مشاهده پلن‌ها",
      secondaryCtaLabel: "درخواست مشاوره",
      imageUrl: "",
      imageAlt: "",
    },
    benefits,
    steps: [
      {
        title: "انتخاب سرویس",
        description: "قابلیت‌ها و پلن مناسب نیازتان را بررسی و انتخاب کنید.",
      },
      {
        title: "تکمیل اطلاعات",
        description: "اطلاعات لازم برای راه‌اندازی سرویس را در پنل ثبت کنید.",
      },
      {
        title: "شروع استفاده",
        description: "پس از فعال‌سازی، سرویس از داخل پنل در دسترس شماست.",
      },
    ],
    trust: {
      title: "راه‌اندازی شفاف و قابل پیگیری",
      description: "وضعیت اشتراک و مراحل آماده‌سازی سرویس از داخل پنل قابل مشاهده است.",
      items: ["مدیریت از پنل Binix", "پشتیبانی در راه‌اندازی", "اطلاعات و دسترسی‌های امن"],
    },
    faq: [],
    cta: {
      title: `برای شروع با ${fallback.name} آماده‌اید؟`,
      description: "پلن مناسب را انتخاب کنید یا برای بررسی نیازهای کسب‌وکارتان با ما در ارتباط باشید.",
      label: "درخواست مشاوره",
      href: "/#consultation",
    },
  };
}

export function normalizeServiceMarketingContent(
  value: unknown,
  fallback: ServiceMarketingFallback,
): ServiceMarketingContent {
  const defaults = createDefaultServiceMarketingContent(fallback);
  const source = record(value);
  const hero = record(source.hero);
  const trust = record(source.trust);
  const cta = record(source.cta);

  const faq = Array.isArray(source.faq)
    ? source.faq
        .map((item) => {
          const entry = record(item);
          return {
            question: text(entry.question),
            answer: text(entry.answer),
          };
        })
        .filter((item) => item.question && item.answer)
        .slice(0, 20)
    : defaults.faq;

  return {
    version: 1,
    hero: {
      eyebrow: text(hero.eyebrow, defaults.hero.eyebrow),
      title: text(hero.title, defaults.hero.title),
      description: text(hero.description, defaults.hero.description),
      primaryCtaLabel: text(hero.primaryCtaLabel, defaults.hero.primaryCtaLabel),
      secondaryCtaLabel: text(hero.secondaryCtaLabel, defaults.hero.secondaryCtaLabel),
      imageUrl: text(hero.imageUrl),
      imageAlt: text(hero.imageAlt),
    },
    benefits: itemList(source.benefits, defaults.benefits),
    steps: itemList(source.steps, defaults.steps),
    trust: {
      title: text(trust.title, defaults.trust.title),
      description: text(trust.description, defaults.trust.description),
      items: stringList(trust.items, defaults.trust.items),
    },
    faq,
    cta: {
      title: text(cta.title, defaults.cta.title),
      description: text(cta.description, defaults.cta.description),
      label: text(cta.label, defaults.cta.label),
      href: text(cta.href, defaults.cta.href),
    },
  };
}
