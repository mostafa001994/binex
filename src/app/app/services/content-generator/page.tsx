import { ContentGeneratorSettingsForm } from "@/components/content-generator/content-generator-settings";
import { ServiceWorkspace } from "@/components/app/service-workspace";

export default function ContentGeneratorAppPage() {
  return (
    <ServiceWorkspace
      service="content-generator"
      title="تولید محتوای هوشمند"
      description="تعریف موضوع، انتخاب منابع و اتصال امن سایت مقصد برای تولید و انتشار محتوا."
      stateDescription="برای شروع، کلمات کلیدی، منابع مرجع و اطلاعات اتصال سایت مقصد را ثبت کنید."
      modules={[
        {
          icon: "sparkles",
          title: "کلمات کلیدی",
          description: "موضوع‌ها و عبارت‌های هدف تولید محتوا را مشخص کنید.",
          status: "setup",
          href: "#content-setup",
        },
        {
          icon: "file-search",
          title: "منابع محتوا",
          description: "URL صفحه‌هایی را ثبت کنید که باید به‌عنوان مرجع بررسی شوند.",
          status: "setup",
          href: "#content-setup",
        },
        {
          icon: "key",
          title: "اتصال انتشار",
          description: "URL و کلیدهای API سایت مقصد را به‌صورت امن ذخیره کنید.",
          status: "setup",
          href: "#content-setup",
        },
      ]}
    >
      <ContentGeneratorSettingsForm />
    </ServiceWorkspace>
  );
}
