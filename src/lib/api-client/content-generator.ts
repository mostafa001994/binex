export type ContentGeneratorSettings = {
  keywords: string[];
  sourceUrls: string[];
  targetSiteUrl: string | null;
  apiKeyConfigured: boolean;
  secretKeyConfigured: boolean;
  connectionConfigured: boolean;
  updatedAt: string;
};

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(
      payload.error?.message || "تنظیمات تولید محتوا قابل ذخیره نیست.",
    );
  }

  return payload.data as T;
}

export function getContentGeneratorSettingsApi() {
  return request<{ settings: ContentGeneratorSettings }>(
    "/api/v1/content-generator/settings",
  );
}

export function saveContentGeneratorSettingsApi(input: {
  keywords: string[];
  sourceUrls: string[];
  targetSiteUrl: string;
  apiKey: string;
  secretKey: string;
}) {
  return request<{ settings: ContentGeneratorSettings }>(
    "/api/v1/content-generator/settings",
    { method: "PATCH", body: JSON.stringify(input) },
  );
}
