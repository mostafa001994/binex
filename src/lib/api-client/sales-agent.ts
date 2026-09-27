export type SalesAgentCredentialStatus = {
  baleBotTokenConfigured: boolean;
  baleBotTokenMasked: string | null;

  woocommerceConfigured: boolean;
  woocommerceStoreUrl: string | null;
  woocommerceConsumerKeyConfigured: boolean;
  woocommerceConsumerSecretConfigured: boolean;
  woocommerceConsumerKeyMasked: string | null;
  woocommerceConsumerSecretMasked: string | null;

  updatedAt: string;
};


export type SalesAgentCredentialVerification = {
  provider: "bale" | "woocommerce";
  jobId: string | null;
  status:
    | "idle"
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "canceled";
  error: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  completedAt: string | null;
};

export type SalesAgentCredentialMutationResult = {
  credentials: SalesAgentCredentialStatus;
  verificationJobId: string | null;
};

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(
      payload.error?.message ||
        payload.error ||
        "درخواست فروشنده هوشمند انجام نشد.",
    );
  }

  return payload.data as T;
}

export function getSalesAgentCredentialsApi() {
  return request<SalesAgentCredentialStatus>(
    "/api/v1/sales-agent/credentials",
  );
}

export function replaceBaleCredentialApi(
  token: string,
) {
  return request<SalesAgentCredentialMutationResult>(
    "/api/v1/sales-agent/credentials",
    {
      method: "PATCH",
      body: JSON.stringify({
        provider: "bale",
        token,
      }),
    },
  );
}

export function replaceWooCommerceCredentialApi(
  input: {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
  },
) {
  return request<SalesAgentCredentialMutationResult>(
    "/api/v1/sales-agent/credentials",
    {
      method: "PATCH",
      body: JSON.stringify({
        provider: "woocommerce",
        ...input,
      }),
    },
  );
}

export function deleteSalesAgentCredentialApi(
  provider: "bale" | "woocommerce",
) {
  return request<SalesAgentCredentialStatus>(
    `/api/v1/sales-agent/credentials/${provider}`,
    {
      method: "DELETE",
    },
  );
}


export function getSalesAgentCredentialVerificationApi(
  provider: "bale" | "woocommerce",
  jobId?: string | null,
) {
  const params = new URLSearchParams({
    provider,
  });

  if (jobId) {
    params.set("jobId", jobId);
  }

  return request<SalesAgentCredentialVerification>(
    `/api/v1/sales-agent/credentials/verification?${params.toString()}`,
  );
}

export async function waitForSalesAgentCredentialVerificationApi(
  provider: "bale" | "woocommerce",
  jobId: string,
  timeoutMs = 45000,
) {
  const startedAt = Date.now();

  let latest =
    await getSalesAgentCredentialVerificationApi(
      provider,
      jobId,
    );

  while (
    latest.status === "pending" ||
    latest.status === "processing"
  ) {
    if (
      Date.now() - startedAt >= timeoutMs
    ) {
      return latest;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1000),
    );

    latest =
      await getSalesAgentCredentialVerificationApi(
        provider,
        jobId,
      );
  }

  return latest;
}
