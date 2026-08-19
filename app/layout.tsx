import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Binix | مدیریت هوشمند با هوش مصنوعی",
  description:
    "Binix؛ ارائه‌دهنده راهکارهای مدیریت، اتوماسیون و هوش مصنوعی برای کسب‌وکارها",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
