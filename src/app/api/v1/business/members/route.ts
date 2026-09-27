import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { addCurrentBusinessMember, listCurrentBusinessMembers } from "@/server/business/business-service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);
  const result = await listCurrentBusinessMembers(user);

  return apiSuccess(result);
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);
  const body = await request.json().catch(() => ({}));
  return apiSuccess(await addCurrentBusinessMember(user, body));
});
