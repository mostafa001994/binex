import type { NextRequest } from "next/server";
import { ApiError } from "@/server/core/api-error";
import { apiError } from "@/server/core/api-response";
import {
  createRequestContext,
  runWithRequestContext,
  type RequestContext,
} from "@/server/core/request-context";

type RouteHandler<TResponse> = (
  request: NextRequest,
  context: RequestContext,
) => Promise<TResponse>;

export function withApiHandler<TResponse>(
  handler: RouteHandler<TResponse>,
) {
  return async function wrapped(request: NextRequest) {
    const context = createRequestContext(request);

    return runWithRequestContext(context, async () => {
      try {
        return await handler(request, context);
      } catch (error) {
        if (error instanceof ApiError) {
          return apiError(error.status, error.code, error.message, {
            fields: error.fields,
            requestId: context.requestId,
          });
        }

        console.error("[Binix API Error]", {
          requestId: context.requestId,
          path: request.nextUrl.pathname,
          error,
        });

        return apiError(
          500,
          "INTERNAL_SERVER_ERROR",
          "خطای غیرمنتظره‌ای رخ داد.",
          { requestId: context.requestId },
        );
      }
    });
  };
}
