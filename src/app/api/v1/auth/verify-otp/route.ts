import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  normalizeIranPhone,
  normalizeOtpCode,
} from "@/server/auth/auth-validation";
import {
  AUTH_COOKIE_NAME,
  verifyOtp,
} from "@/server/auth/auth-service";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIranPhone(body.phone);
  const code = normalizeOtpCode(body.code);

  const result = await verifyOtp(phone, code);

  const response = apiSuccess({
    user: result.user,
    authenticated: true,
  });

  response.cookies.set(AUTH_COOKIE_NAME, result.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(result.sessionExpiresAt),
  });

  return response;
});
