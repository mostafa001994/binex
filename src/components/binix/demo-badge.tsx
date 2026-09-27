import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <Badge variant="warning" className={className}>
      <Eye size={13} aria-hidden="true" />
      محیط نمایشی
    </Badge>
  );
}
