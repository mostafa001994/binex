import { NextResponse } from "next/server";
import type {
  ApiErrorBody,
  ApiSuccess,
  ApiFieldErrors,
} from "@/types/api/common";

export function apiSuccess<T, M = Record<string, never>>(
  data: T,
  init?: {
    status?: number;
    meta?: M;
    headers?: HeadersInit;
  },
) {
  const body: ApiSuccess<T, M> = {
    success: true,
    data,
    ...(init?.meta ? { meta: init.meta } : {}),
  };

  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

export function apiError(
  status: number,
  code: string,
  message: string,
  options?: {
    fields?: ApiFieldErrors;
    requestId?: string;
    headers?: HeadersInit;
  },
) {
  const body: ApiErrorBody = {
    success: false,
    error: {
      code,
      message,
      ...(options?.fields ? { fields: options.fields } : {}),
      ...(options?.requestId ? { requestId: options.requestId } : {}),
    },
  };

  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...options?.headers,
    },
  });
}
