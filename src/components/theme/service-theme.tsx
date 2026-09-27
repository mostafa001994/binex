import type { CSSProperties, ReactNode } from "react";
import { iconRegistry } from "@/constants/icon-registry";
import { serviceById, type ServiceId } from "@/constants/services-config";

export function ServiceTheme({
  service,
  children,
  className = "",
}: {
  service: ServiceId;
  children: ReactNode;
  className?: string;
}) {
  const theme = serviceById[service].theme;
  const style = {
    "--service-accent": theme.accent,
    "--service-accent-secondary": theme.accentSecondary,
    "--service-accent-rgb": theme.accentRgb,
  } as CSSProperties;

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export function ServiceIcon({
  service,
  size = 20,
  className = "",
}: {
  service: ServiceId;
  size?: number;
  className?: string;
}) {
  const Icon = iconRegistry[serviceById[service].icon];
  return <Icon size={size} className={className} aria-hidden="true" />;
}
