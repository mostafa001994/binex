export type ApiSuccess<T, M = Record<string, never>> = {
  success: true;
  data: T;
  meta?: M;
};

export type ApiFieldErrors = Record<string, string[]>;

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: ApiFieldErrors;
    requestId?: string;
  };
};

export type ApiResponse<T, M = Record<string, never>> =
  | ApiSuccess<T, M>
  | ApiErrorBody;

export type HealthStatus = "ok" | "degraded";

export type HealthPayload = {
  status: HealthStatus;
  service: "binix-api";
  version: "v1";
  dataDriver: "mock" | "database";
  timestamp: string;
};

export type MetaPayload = {
  product: {
    name: "Binix";
    apiVersion: "v1";
    locale: "fa-IR";
    direction: "rtl";
  };
  capabilities: {
    auth: "foundation";
    admin: "planned";
    database: "not-connected";
  };
};
