import { AsyncLocalStorage } from "node:async_hooks";
import type { NextRequest } from "next/server";

export type RequestContext = {
  requestId: string;
  ip: string | null;
  userAgent: string | null;
};

const requestContextStorage =
  new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(
  context: RequestContext,
  callback: () => Promise<T>,
) {
  return requestContextStorage.run(context, callback);
}

export function getRequestContext() {
  return requestContextStorage.getStore() ?? null;
}

export function createRequestContext(request: NextRequest): RequestContext {
  return {
    requestId: crypto.randomUUID(),
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null,
    userAgent: request.headers.get("user-agent"),
  };
}
