const configuredUrl =
  process.env.BINIX_PUBLIC_SITE_URL ||
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://127.0.0.1:5000";

export const siteConfig = {
  name: "Binix",
  title: "Binix | هوش مصنوعی برای کسب‌وکار",
  description: "پلتفرم هوشمند کسب‌وکار برای فروش، رزرو، تحلیل داده و هوش تجاری.",
  url: configuredUrl.replace(/\/$/, ""),
} as const;

export function absoluteUrl(path: string) {
  return new URL(path, `${siteConfig.url}/`).toString();
}
