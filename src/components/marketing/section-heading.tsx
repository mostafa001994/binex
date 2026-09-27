import { cn } from "@/lib/cn";

export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
  serviceTone = false,
  className,
}: {
  badge?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
  serviceTone?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-right", className)}>
      {badge && (
        <span
          className={cn(
            "font-ui inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold",
            serviceTone
              ? "border-service-accent/20 bg-service-accent/10 text-service-accent"
              : "border-accent/20 bg-accent/10 text-accent",
          )}
        >
          {badge}
        </span>
      )}

      <h2 className="font-display mx-auto mt-3 max-w-3xl text-2xl font-bold leading-relaxed text-marketing-text sm:text-3xl lg:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="font-ui mx-auto mt-4 max-w-2xl text-sm leading-8 text-marketing-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
