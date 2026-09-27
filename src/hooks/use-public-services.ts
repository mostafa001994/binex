"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  getPublicServicesApi,
  type PublicServiceItem,
} from "@/lib/api-client/service-catalog";

let cache:
  | PublicServiceItem[]
  | null = null;

let pending:
  | Promise<PublicServiceItem[]>
  | null = null;

function load() {
  if (cache) {
    return Promise.resolve(cache);
  }

  if (!pending) {
    pending =
      getPublicServicesApi()
        .then((result) => {
          cache =
            result.services;
          return result.services;
        })
        .finally(() => {
          pending = null;
        });
  }

  return pending;
}

export function usePublicServices() {
  const [services, setServices] =
    useState<
      PublicServiceItem[] | null
    >(cache);
  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    load()
      .then((items) => {
        if (active) {
          setServices(items);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "سرویس‌ها قابل دریافت نیستند.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    services,
    error,
  };
}
