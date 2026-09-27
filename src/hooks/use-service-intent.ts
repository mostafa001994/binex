"use client";

import { useMemo } from "react";
import { usePublicServices } from "@/hooks/use-public-services";

export function useServiceIntent(
  candidate: string | null,
) {
  const {
    services,
    error,
  } = usePublicServices();

  const service = useMemo(
    () =>
      services?.find(
        (item) =>
          item.id ===
            candidate &&
          item.availability ===
            "available",
      ) ?? null,
    [candidate, services],
  );

  return {
    service,
    serviceId:
      service?.id ?? null,
    ready:
      services !== null,
    error,
  };
}
