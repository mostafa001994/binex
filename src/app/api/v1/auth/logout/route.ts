import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  logout,
} from "@/server/auth/auth-service";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  await logout(token);

  const response = apiSuccess({ loggedOut: true });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
});
