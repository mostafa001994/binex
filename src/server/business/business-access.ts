import type { CurrentBusinessContext } from "@/server/business/business-types";
import { ForbiddenApiError } from "@/server/core/api-error";

export function requireBusinessActive(
  context: CurrentBusinessContext,
) {
  if (
    context.business.status ===
    "suspended"
  ) {
    throw new ForbiddenApiError(
      "این کسب‌وکار توسط مدیریت تعلیق شده است.",
    );
  }

  return context;
}
