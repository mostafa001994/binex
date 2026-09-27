import { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function Section({
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={`py-24 ${className}`}>
      {children}
    </section>
  );
}