"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CurrentBusinessResponse } from "@/lib/api-client/business";

const BusinessContext =
  createContext<CurrentBusinessResponse | null>(null);

const BusinessActionsContext = createContext<{
  setBusinessContext: (value: CurrentBusinessResponse) => void;
} | null>(null);

export function BusinessProvider({
  value: initialValue,
  children,
}: {
  value: CurrentBusinessResponse;
  children: ReactNode;
}) {
  const [value, setBusinessContext] = useState(initialValue);
  const actions = useMemo(() => ({ setBusinessContext }), []);

  return (
    <BusinessActionsContext.Provider value={actions}>
      <BusinessContext.Provider value={value}>
        {children}
      </BusinessContext.Provider>
    </BusinessActionsContext.Provider>
  );
}

export function useBusiness() {
  const value = useContext(BusinessContext);

  if (!value) {
    throw new Error(
      "useBusiness must be used inside BusinessProvider",
    );
  }

  return value;
}

export function useBusinessActions() {
  const actions = useContext(BusinessActionsContext);

  if (!actions) {
    throw new Error(
      "useBusinessActions must be used inside BusinessProvider",
    );
  }

  return actions;
}
