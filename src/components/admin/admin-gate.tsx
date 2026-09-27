"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getAdminSessionApi } from "@/lib/api-client/admin";

type AdminSession = Awaited<
  ReturnType<typeof getAdminSessionApi>
>;

const AdminSessionContext =
  createContext<AdminSession | null>(null);

export function useAdminSession() {
  const session = useContext(AdminSessionContext);

  if (!session) {
    throw new Error(
      "useAdminSession must be used inside AdminGate",
    );
  }

  return session;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] =
    useState<AdminSession | null>(null);

  useEffect(() => {
    let active = true;

    getAdminSessionApi()
      .then((result) => {
        if (active) setSession(result);
      })
      .catch(() => {
        if (!active) return;
        router.replace("/app");
        router.refresh();
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-card border border-primary/15 bg-primary/10 text-primary">
            <ShieldCheck size={20} />
          </div>
          <div className="font-ui text-sm font-semibold text-foreground">
            در حال بررسی دسترسی مدیریت...
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminSessionContext.Provider value={session}>
      {children}
    </AdminSessionContext.Provider>
  );
}
