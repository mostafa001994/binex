"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppRole } from "@/lib/roles";

export type SessionUser = {
  id: string;
  phone: string;
  name: string | null;
  role: AppRole;
  permissions: string[];
  preferences: {
    importantNotificationsOnly: boolean;
  };
  createdAt: string;
};

const AuthSessionContext = createContext<SessionUser | null>(null);
const AuthSessionActionsContext = createContext<{
  setUser: (user: SessionUser) => void;
} | null>(null);

export function AuthSessionProvider({
  user: initialUser,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const [user, setUser] = useState(initialUser);
  const actions = useMemo(() => ({ setUser }), []);

  return (
    <AuthSessionActionsContext.Provider value={actions}>
      <AuthSessionContext.Provider value={user}>
        {children}
      </AuthSessionContext.Provider>
    </AuthSessionActionsContext.Provider>
  );
}

export function useAuthSession() {
  const user = useContext(AuthSessionContext);

  if (!user) {
    throw new Error(
      "useAuthSession must be used inside AuthSessionProvider",
    );
  }

  return user;
}

export function useAuthSessionActions() {
  const actions = useContext(AuthSessionActionsContext);

  if (!actions) {
    throw new Error(
      "useAuthSessionActions must be used inside AuthSessionProvider",
    );
  }

  return actions;
}
