import { SectionHeading } from "@/components/marketing/section-heading";

export default function ServiceSectionHeading({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description?: string;
}) {
  return (
    <SectionHeading
      badge={badge}
      title={title}
      description={description}
      serviceTone
    />
  );
}
