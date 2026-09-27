type ApiErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

type ApiSuccessPayload<T> = {
  success: true;
  data: T;
};

async function request<T>(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const payload = (await response.json()) as
    | ApiSuccessPayload<T>
    | ApiErrorPayload;

  if (!response.ok || !payload.success) {
    const error = payload as ApiErrorPayload;
    throw new Error(error.error?.message || "خطا در ارتباط با سرور.");
  }

  return payload.data;
}

export function requestOtpApi(phone: string) {
  return request<{
    challengeId: string;
    expiresInSeconds: number;
    resendAfterSeconds: number;
    devCode?: string;
  }>("/api/v1/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtpApi(phone: string, code: string) {
  return request<{
    authenticated: true;
    user: {
      id: string;
      phone: string;
      name: string | null;
      role: AppRole;
      permissions: string[];
      preferences: { importantNotificationsOnly: boolean };
      createdAt: string;
    };
  }>("/api/v1/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

export function getMeApi() {
  return request<{
    authenticated: true;
    user: {
      id: string;
      phone: string;
      name: string | null;
      role: AppRole;
      permissions: string[];
      preferences: { importantNotificationsOnly: boolean };
      createdAt: string;
    };
  }>("/api/v1/auth/me", {
    method: "GET",
  });
}

export function logoutApi() {
  return request<{ loggedOut: true }>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export type SessionOverview = {
  current: { id: string; createdAt: string; expiresAt: string };
  activeCount: number;
  policy: "single-session";
};

export function getSessionOverviewApi() {
  return request<SessionOverview>("/api/v1/auth/sessions", { method: "GET" });
}


export function updateMeApi(name: string, importantNotificationsOnly?: boolean) {
  return request<{
    authenticated: true;
    user: {
      id: string;
      phone: string;
      name: string | null;
      role: AppRole;
      permissions: string[];
      preferences: { importantNotificationsOnly: boolean };
      createdAt: string;
    };
  }>("/api/v1/auth/me", {
    method: "PATCH",
    body: JSON.stringify({
      name,
      ...(importantNotificationsOnly === undefined
        ? {}
        : { preferences: { importantNotificationsOnly } }),
    }),
  });
}
import type { AppRole } from "@/lib/roles";
