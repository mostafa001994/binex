import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { ValidationApiError } from "@/server/core/api-error";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { searchAdminAudit } from "@/server/admin/admin-service";
import {
  isAuditAction,
  isAuditTargetType,
} from "@/lib/audit";
import type {
  AuditActionValue,
  AuditTargetType,
} from "@/lib/audit";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const token =
    request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);
  const params = request.nextUrl.searchParams;
  const rawAction = params.get("action") || "";
  const rawTargetType = params.get("targetType") || "";
  const actorQuery = params.get("actorQuery")?.trim() || "";
  const targetId = params.get("targetId")?.trim() || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "30");

  if (rawAction && !isAuditAction(rawAction)) {
    throw new ValidationApiError("عملیات Audit معتبر نیست.");
  }

  if (rawTargetType && !isAuditTargetType(rawTargetType)) {
    throw new ValidationApiError("نوع هدف Audit معتبر نیست.");
  }

  if (actorQuery.length > 200 || targetId.length > 200) {
    throw new ValidationApiError("عبارت جست‌وجوی Audit بیش از حد طولانی است.");
  }

  if ((from && Number.isNaN(Date.parse(from))) || (to && Number.isNaN(Date.parse(to)))) {
    throw new ValidationApiError("بازه زمانی Audit معتبر نیست.");
  }

  if (!Number.isInteger(page) || page < 1) {
    throw new ValidationApiError("شماره صفحه معتبر نیست.");
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new ValidationApiError("تعداد نتایج هر صفحه باید بین ۱ تا ۱۰۰ باشد.");
  }

  const action: AuditActionValue | "" = rawAction as AuditActionValue | "";
  const targetType: AuditTargetType | "" = rawTargetType as AuditTargetType | "";

  return apiSuccess(
    await searchAdminAudit(user, {
      action,
      actorUserId: params.get("actorUserId") || "",
      actorQuery,
      targetType,
      targetId,
      from,
      to,
      page,
      pageSize,
    }),
  );
});
