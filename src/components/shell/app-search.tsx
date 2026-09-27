"use client";

import {
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getServicesApi,
  type ServiceApiItem,
} from "@/lib/api-client/services";
import { getServiceAppHref } from "@/lib/service-links";

export function AppSearch() {
  const [query, setQuery] =
    useState("");
  const [mobile, setMobile] =
    useState(false);
  const [services, setServices] =
    useState<ServiceApiItem[]>([]);
  const input =
    useRef<HTMLInputElement>(
      null,
    );

  useEffect(() => {
    getServicesApi()
      .then((result) =>
        setServices(
          result.services,
        ),
      )
      .catch(() => {});
  }, []);

  const q =
    query.trim().toLowerCase();

  const results = q
    ? services
        .filter((service) =>
          `${service.name} ${service.category} ${service.description}`
            .toLowerCase()
            .includes(q),
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    if (mobile) {
      input.current?.focus();
    }
  }, [mobile]);

  const box = (
    <div className="relative w-full md:w-[320px]">
      <Search
        size={17}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
      />
      <input
        ref={input}
        type="search"
        value={query}
        onChange={(event) =>
          setQuery(
            event.target.value,
          )
        }
        placeholder="جستجو در سرویس‌ها..."
        className="font-ui h-10 w-full rounded-control border border-border bg-surface pr-10 pl-3 text-sm text-foreground outline-none transition placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary/10"
      />

      {query ? (
        <div className="absolute inset-x-0 top-12 z-50 rounded-card border border-border bg-surface p-1.5 shadow-binix-lg">
          {results.length ? (
            results.map(
              (service) => (
                <Link
                  key={
                    service.id
                  }
                  href={getServiceAppHref(
                    service,
                  )}
                  onClick={() => {
                    setQuery("");
                    setMobile(
                      false,
                    );
                  }}
                  className="block rounded-control px-3 py-2.5 transition hover:bg-surface-hover"
                >
                  <div className="font-ui text-sm font-medium text-foreground">
                    {
                      service.name
                    }
                  </div>
                  <div className="mt-0.5 font-ui text-xs text-foreground-subtle">
                    {
                      service.category
                    }
                  </div>
                </Link>
              ),
            )
          ) : (
            <div className="p-4 text-center font-ui text-sm text-foreground-muted">
              نتیجه‌ای پیدا نشد.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        {box}
      </div>

      <button
        type="button"
        onClick={() =>
          setMobile(true)
        }
        className="flex size-10 items-center justify-center rounded-control text-foreground-muted transition hover:bg-surface-hover md:hidden"
        aria-label="جستجو"
      >
        <Search size={18} />
      </button>

      {mobile ? (
        <div className="fixed inset-0 z-[70] bg-background p-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              {box}
            </div>
            <button
              type="button"
              onClick={() => {
                setMobile(false);
                setQuery("");
              }}
              className="flex size-10 shrink-0 items-center justify-center rounded-control border border-border"
              aria-label="بستن جستجو"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
