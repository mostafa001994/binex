import type { NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";

import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

import { getSalesAgentCredentialVerification } from "@/server/sales-agent/sales-agent-service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const token =
      request.cookies.get(
        AUTH_COOKIE_NAME,
      )?.value;

    const user =
      await getAuthenticatedUser(token);

    const provider =
      request.nextUrl.searchParams.get(
        "provider",
      );

    const jobId =
      request.nextUrl.searchParams.get(
        "jobId",
      );

    return apiSuccess(
      await getSalesAgentCredentialVerification(
        user,
        provider,
        jobId,
      ),
    );
  },
);
