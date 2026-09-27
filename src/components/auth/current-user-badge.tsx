"use client";

import { Phone, UserRound } from "lucide-react";
import { useAuthSession } from "@/components/auth/auth-session";

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length !== 11) {
    return phone;
  }

  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function CurrentUserBadge() {
  const user = useAuthSession();

  return (
    <div className="flex items-center gap-2 rounded-control border border-border bg-surface-raised/70 px-3 py-2">
      <div className="flex size-7 items-center justify-center rounded-control bg-primary/10 text-primary">
        <UserRound size={14} />
      </div>

      <div className="min-w-0">
        <div className="font-ui text-[9px] leading-4 text-foreground-subtle">
          حساب شما
        </div>
        <div
          dir="ltr"
          className="font-ui flex items-center gap-1.5 text-[11px] font-semibold text-foreground"
        >
          <Phone size={11} className="text-primary" />
          {formatPhone(user.phone)}
        </div>
      </div>
    </div>
  );
}
