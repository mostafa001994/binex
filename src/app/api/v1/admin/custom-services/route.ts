import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { createAdminCustomService, listAdminCustomServices } from "@/server/custom-services/custom-service-service";

export const dynamic = "force-dynamic";

async function user(request: NextRequest) {
  return getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

export const GET = withApiHandler(async (request: NextRequest) =>
  apiSuccess(await listAdminCustomServices(await user(request))),
);

export const POST = withApiHandler(async (request: NextRequest) =>
  apiSuccess({ service: await createAdminCustomService(await user(request), await request.json().catch(() => ({}))) }),
);
