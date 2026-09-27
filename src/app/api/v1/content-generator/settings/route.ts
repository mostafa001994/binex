import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  getContentGeneratorSettings,
  saveContentGeneratorSettings,
} from "@/server/content-generator/content-generator-service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);
  return apiSuccess(await getContentGeneratorSettings(user));
});

export const PATCH = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);
  const body = await request.json().catch(() => ({}));
  return apiSuccess(await saveContentGeneratorSettings(user, body));
});
