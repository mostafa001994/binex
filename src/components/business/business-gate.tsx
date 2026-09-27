"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Building2, RefreshCcw } from "lucide-react";
import {
  getCurrentBusinessApi,
  type CurrentBusinessResponse,
} from "@/lib/api-client/business";
import { BusinessProvider } from "@/components/business/business-context";
import { Button } from "@/components/ui/button";

export function BusinessGate({ children }: { children: ReactNode }) {
  const [business, setBusiness] =
    useState<CurrentBusinessResponse | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async () => {
    setError("");

    try {
      setBusiness(await getCurrentBusinessApi());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "فضای کسب‌وکار قابل دریافت نیست.",
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, attempt]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="max-w-md rounded-card border border-error/20 bg-surface p-6 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-card bg-error/10 text-error">
            <Building2 size={19} />
          </div>
          <h2 data-display-title="true" className="mt-4 text-lg font-bold">
            دریافت فضای کسب‌وکار انجام نشد
          </h2>
          <p className="mt-2 font-ui text-sm leading-7 text-foreground-muted">
            {error}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            leadingIcon={<RefreshCcw size={15} />}
            onClick={() => setAttempt((value) => value + 1)}
          >
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-11 items-center justify-center rounded-card border border-primary/15 bg-primary/10 text-primary">
            <Building2 size={19} />
          </div>
          <div className="font-ui text-sm font-semibold text-foreground">
            در حال آماده‌سازی فضای کسب‌وکار...
          </div>
        </div>
      </div>
    );
  }

  return (
    <BusinessProvider value={business}>
      {children}
    </BusinessProvider>
  );
}
