import { Sparkles } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

type AIActionProps = Omit<ComponentProps<typeof Button>, "variant">;

export function AIAction({
  leadingIcon,
  ...props
}: AIActionProps) {
  return (
    <Button
      {...props}
      variant="ai"
      leadingIcon={leadingIcon ?? <Sparkles size={17} aria-hidden="true" />}
    />
  );
}
