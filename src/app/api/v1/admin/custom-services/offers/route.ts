import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { createAdminCustomOffer, listAdminCustomOffers } from "@/server/custom-services/custom-service-service";

async function user(request: NextRequest) {
  return getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

export const GET = withApiHandler(async (request: NextRequest) =>
  apiSuccess(await listAdminCustomOffers(await user(request))),
);

export const POST = withApiHandler(async (request: NextRequest) =>
  apiSuccess({ offer: await createAdminCustomOffer(await user(request), await request.json().catch(() => ({}))) }),
);
