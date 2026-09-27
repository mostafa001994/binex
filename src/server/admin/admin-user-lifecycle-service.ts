import { SystemRole } from "@/generated/prisma/client";
import type { AuthUser } from "@/server/auth/auth-types";
import { canManageUserIdentity, requireAdminPermission, requireSuperAdmin } from "@/server/admin/admin-service";
import { ConflictApiError, ForbiddenApiError, NotFoundApiError, ValidationApiError } from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { getAuditRepository, getUserRepository } from "@/server/repositories/repository-provider";

const PHONE_PATTERN = /^09\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function identity(body: Record<string, unknown>) {
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;
  const email = typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : null;
  if (name && name.length > 120) throw new ValidationApiError("نام کاربر حداکثر ۱۲۰ کاراکتر است.");
  if (email && (email.length > 254 || !EMAIL_PATTERN.test(email))) throw new ValidationApiError("ایمیل کاربر معتبر نیست.");
  return { name, email };
}

export async function createAdminUser(user: AuthUser, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.users.manage");
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!PHONE_PATTERN.test(phone)) throw new ValidationApiError("شماره موبایل باید با فرمت 09xxxxxxxxx وارد شود.");
  const { name, email } = identity(body);
  const prisma = getPrismaClient();
  const duplicate = await prisma.user.findFirst({
    where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
  });
  if (duplicate) throw new ConflictApiError("کاربری با این شماره موبایل یا ایمیل قبلاً ثبت شده است.");

  let role = await prisma.accessRole.findUnique({ where: { code: "user" } });
  if (typeof body.accessRoleId === "string" && body.accessRoleId) {
    requireSuperAdmin(user);
    if (!UUID_PATTERN.test(body.accessRoleId)) throw new ValidationApiError("نقش انتخاب‌شده معتبر نیست.");
    role = await prisma.accessRole.findUnique({ where: { id: body.accessRoleId } });
  }
  if (!role) throw new NotFoundApiError("نقش پیش‌فرض کاربر پیدا نشد.");
  const created = await prisma.user.create({ data: { phone, name, email, accessRoleId: role.id, systemRole: role.systemRole ?? SystemRole.USER } });
  await getAuditRepository().create({ actorUserId: user.id, action: "user_created", targetType: "user", targetId: created.id, metadata: { phone, role: role.code } });
  return getUserRepository().findById(created.id);
}

export async function updateAdminUserIdentity(user: AuthUser, userId: string, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.users.manage");
  const target = await getUserRepository().findById(userId);
  if (!target) throw new NotFoundApiError("کاربر پیدا نشد.");
  if (!canManageUserIdentity(user, target)) throw new ForbiddenApiError("ویرایش اطلاعات این حساب مجاز نیست.");
  const { name, email } = identity(body);
  if (email) {
    const duplicate = await getPrismaClient().user.findFirst({ where: { email, id: { not: userId } } });
    if (duplicate) throw new ConflictApiError("این ایمیل قبلاً برای حساب دیگری ثبت شده است.");
  }
  await getPrismaClient().user.update({ where: { id: userId }, data: { name, email } });
  await getAuditRepository().create({ actorUserId: user.id, action: "user_profile_updated", targetType: "user", targetId: userId, metadata: { beforeName: target.name, afterName: name, beforeEmail: target.email, afterEmail: email } });
  return getUserRepository().findById(userId);
}

export async function listAdminRoleOptions(user: AuthUser) {
  requireAdminPermission(user, "admin.users.read");
  return getPrismaClient().accessRole.findMany({ select: { id: true, code: true, name: true, isProtected: true }, orderBy: { createdAt: "asc" } });
}
