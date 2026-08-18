import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Binex | مدیریت هوشمند با هوش مصنوعی",
  description:
    "Binex؛ ارائه‌دهنده راهکارهای مدیریت، اتوماسیون و هوش مصنوعی برای کسب‌وکارها",
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
