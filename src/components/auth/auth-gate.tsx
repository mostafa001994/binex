"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getMeApi } from "@/lib/api-client/auth";
import {
  AuthSessionProvider,
  type SessionUser,
} from "@/components/auth/auth-session";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let active = true;

    getMeApi()
      .then((result) => {
        if (active) {
          setUser(result.user);
        }
      })
      .catch(() => {
        if (!active) return;
        router.replace("/login");
        router.refresh();
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-11 items-center justify-center rounded-card border border-primary/15 bg-primary/10 text-primary">
            <ShieldCheck size={19} />
          </div>
          <div className="font-ui text-sm font-semibold text-foreground">
            در حال بررسی دسترسی...
          </div>
          <div className="h-1 w-28 overflow-hidden rounded-full bg-surface-raised">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthSessionProvider user={user}>
      {children}
    </AuthSessionProvider>
  );
}
