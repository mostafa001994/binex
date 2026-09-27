import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { normalizeIranPhone } from "@/server/auth/auth-validation";
import { requestOtp } from "@/server/auth/auth-service";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIranPhone(body.phone);

  const result = await requestOtp(phone);

  return apiSuccess(result, { status: 201 });
});
