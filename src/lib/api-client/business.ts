import type { IconKey } from "@/constants/icon-registry";

type ApiErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

type ApiSuccessPayload<T> = {
  success: true;
  data: T;
};

async function request<T>(
  url: string,
  init?: RequestInit,
) {
  const response = await fetch(
    url,
    {
      method:
        init?.method ?? "GET",
      ...init,
      headers: {
        Accept:
          "application/json",
        ...(init?.body
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),
        ...(init?.headers || {}),
      },
    },
  );

  const payload =
    (await response.json()) as
      | ApiSuccessPayload<T>
      | ApiErrorPayload;

  if (
    !response.ok ||
    !payload.success
  ) {
    const error =
      payload as ApiErrorPayload;

    throw new Error(
      error.error?.message ||
        "خطا در دریافت اطلاعات.",
    );
  }

  return payload.data;
}

export type BusinessServiceView = {
  id: string;
  businessId: string;
  serviceId: string;
  status:
    | "setup"
    | "active"
    | "paused"
    | "coming-soon";
  setupCompleted: boolean;
  createdAt: string;
  service: {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    category: string;
    description: string;
    appHref: string | null;
    marketingHref: string;
    availability:
      | "available"
      | "coming-soon";
    visibility:
      | "public"
      | "private";
    accent: string;
    iconKey: IconKey;
    sortOrder: number;
    features: string[];
  };
};

export type CurrentBusinessResponse = {
  dataMode:
    | "mock"
    | "database";
  business: {
    id: string;
    name: string;
    phone: string | null;
    category: string | null;
    status:
      | "active"
      | "suspended";
    createdAt: string;
  };
  membership: {
    id: string;
    businessId: string;
    userId: string;
    role:
      | "owner"
      | "admin"
      | "member";
    createdAt: string;
  };
  services:
    BusinessServiceView[];
};

export function getCurrentBusinessApi() {
  return request<CurrentBusinessResponse>(
    "/api/v1/business",
  );
}

export function updateCurrentBusinessApi(
  name: string,
) {
  return request<CurrentBusinessResponse>(
    "/api/v1/business",
    {
      method: "PATCH",
      body: JSON.stringify({
        name,
      }),
    },
  );
}

export function getCurrentBusinessMembersApi() {
  return request<CurrentBusinessMembersResponse>(
    "/api/v1/business/members",
  );
}

export type CurrentBusinessMember = {
  id: string;
  businessId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
  user: { name: string | null; phone: string };
  isCurrentUser: boolean;
};

export type CurrentBusinessMembersResponse = {
  business: CurrentBusinessResponse["business"];
  access: { canManage: boolean };
  members: CurrentBusinessMember[];
};

export function addCurrentBusinessMemberApi(phone: string, role: "admin" | "member") {
  return request<CurrentBusinessMembersResponse>("/api/v1/business/members", {
    method: "POST",
    body: JSON.stringify({ phone, role }),
  });
}

export function updateCurrentBusinessMemberApi(memberId: string, role: "admin" | "member") {
  return request<CurrentBusinessMembersResponse>(`/api/v1/business/members/${encodeURIComponent(memberId)}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function removeCurrentBusinessMemberApi(memberId: string) {
  return request<CurrentBusinessMembersResponse>(`/api/v1/business/members/${encodeURIComponent(memberId)}`, {
    method: "DELETE",
  });
}

export function getCurrentBusinessServicesApi() {
  return request<{
    businessId: string;
    services:
      CurrentBusinessResponse["services"];
  }>(
    "/api/v1/business/services",
  );
}
