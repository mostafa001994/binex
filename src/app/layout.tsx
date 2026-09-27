import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { BinixToaster } from "@/components/ui/binix-toaster";

import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { defaultSocialImage, safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: "Binix | هوش مصنوعی برای کسب‌وکار",
    template: "%s | Binix",
  },

  description: siteConfig.description,

  applicationName: siteConfig.name,

  authors: [
    {
      name: "تیم Binix",
      url: siteConfig.url,
    },
  ],

  creator: "Binix",
  publisher: "Binix",
  category: "technology",

  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      }
    : undefined,

  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [defaultSocialImage],
  },

  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [defaultSocialImage.url],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/img/Binix-Logo.png"),
        },
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: siteConfig.name,
        url: siteConfig.url,
        inLanguage: "fa-IR",
        publisher: {
          "@id": absoluteUrl("/#organization"),
        },
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("binix-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`,
          }}
        />
      </head>

      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(organizationSchema),
          }}
        />

        <ThemeProvider>
          {children}
        </ThemeProvider>

        <BinixToaster />
      </body>
    </html>
  );
}
