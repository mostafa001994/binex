import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { ValidationApiError } from "@/server/core/api-error";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { createCustomServiceCheckout } from "@/server/custom-services/custom-service-service";
import { resolvePaymentCallbackUrl } from "@/server/payments/payment-test-mode";

export async function POST(request: NextRequest, context: { params: Promise<{ offerId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    const body = await req.json().catch(() => ({}));
    if (typeof body.gatewayId !== "string" || !body.gatewayId) throw new ValidationApiError("درگاه پرداخت را انتخاب کنید.");
    const result = await createCustomServiceCheckout({
      user,
      offerId: (await context.params).offerId,
      gatewayId: body.gatewayId,
      termsAccepted: body.termsAccepted === true,
      callbackUrl: resolvePaymentCallbackUrl(req.url, body.gatewayId, req.headers.get("host")),
    });
    return apiSuccess({ checkout: result });
  })(request);
}
