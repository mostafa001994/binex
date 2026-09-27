import { SystemRole } from "@/generated/prisma/client";
import {
  ADMIN_PERMISSION_CATALOG,
  isAdminPermission,
  type AdminPermission,
} from "@/lib/admin-permissions";
import type { AuthUser } from "@/server/auth/auth-types";
import { requireSuperAdmin } from "@/server/admin/admin-service";
import {
  ConflictApiError,
  ForbiddenApiError,
  NotFoundApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { getAuditRepository, getUserRepository } from "@/server/repositories/repository-provider";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CODE_PATTERN = /^[a-z][a-z0-9-]{2,79}$/;

function parsePermissions(value: unknown): AdminPermission[] {
  if (!Array.isArray(value) || !value.every(isAdminPermission)) {
    throw new ValidationApiError("فهرست مجوزها معتبر نیست.");
  }

  const permissions = [...new Set(value)];
  if (permissions.includes("admin.roles.manage")) {
    throw new ForbiddenApiError("مجوز مدیریت نقش‌ها فقط برای مدیر ارشد محفوظ است.");
  }
  return permissions;
}

function parseText(value: unknown, field: string, min: number, max: number) {
  if (typeof value !== "string") throw new ValidationApiError(`${field} الزامی است.`);
  const text = value.trim();
  if (text.length < min || text.length > max) {
    throw new ValidationApiError(`${field} باید بین ${min} تا ${max} کاراکتر باشد.`);
  }
  return text;
}

function mapRole(role: {
  id: string; code: string; name: string; description: string | null;
  systemRole: SystemRole | null; isProtected: boolean; createdAt: Date; updatedAt: Date;
  permissions: Array<{ permissionCode: string }>;
  _count?: { users: number };
}) {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
    isSystem: role.systemRole !== null,
    isProtected: role.isProtected,
    permissions: role.permissions.map((item) => item.permissionCode),
    userCount: role._count?.users ?? 0,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}

export async function listAdminAccessRoles(user: AuthUser) {
  requireSuperAdmin(user);
  const roles = await getPrismaClient().accessRole.findMany({
    include: { permissions: true, _count: { select: { users: true } } },
    orderBy: [{ isProtected: "desc" }, { createdAt: "asc" }],
  });
  return { roles: roles.map(mapRole), permissions: ADMIN_PERMISSION_CATALOG };
}

export async function createAdminAccessRole(user: AuthUser, body: Record<string, unknown>) {
  requireSuperAdmin(user);
  const code = parseText(body.code, "کد نقش", 3, 80).toLowerCase();
  if (!CODE_PATTERN.test(code)) throw new ValidationApiError("کد نقش باید با حرف انگلیسی شروع شود و فقط شامل حروف کوچک، عدد و خط تیره باشد.");
  const name = parseText(body.name, "نام نقش", 2, 120);
  const description = typeof body.description === "string" && body.description.trim() ? body.description.trim().slice(0, 500) : null;
  const permissions = parsePermissions(body.permissions);
  const prisma = getPrismaClient();
  if (await prisma.accessRole.findUnique({ where: { code } })) throw new ConflictApiError("این کد نقش قبلاً ثبت شده است.");

  const role = await prisma.accessRole.create({
    data: {
      code, name, description,
      permissions: { create: permissions.map((permissionCode) => ({ permissionCode })) },
    },
    include: { permissions: true, _count: { select: { users: true } } },
  });
  await getAuditRepository().create({ actorUserId: user.id, action: "access_role_created", targetType: "access-role", targetId: role.id, metadata: { code, permissionCount: permissions.length } });
  return mapRole(role);
}

export async function updateAdminAccessRole(user: AuthUser, roleId: string, body: Record<string, unknown>) {
  requireSuperAdmin(user);
  if (!UUID_PATTERN.test(roleId)) throw new NotFoundApiError("نقش پیدا نشد.");
  const prisma = getPrismaClient();
  const existing = await prisma.accessRole.findUnique({ where: { id: roleId }, include: { permissions: true } });
  if (!existing) throw new NotFoundApiError("نقش پیدا نشد.");
  if (existing.isProtected) throw new ForbiddenApiError("نقش مدیر ارشد حفاظت‌شده و قابل ویرایش نیست.");

  const name = parseText(body.name, "نام نقش", 2, 120);
  const description = typeof body.description === "string" && body.description.trim() ? body.description.trim().slice(0, 500) : null;
  const permissions = parsePermissions(body.permissions);
  const role = await prisma.$transaction(async (tx) => {
    await tx.accessRolePermission.deleteMany({ where: { roleId } });
    return tx.accessRole.update({
      where: { id: roleId },
      data: { name, description, permissions: { create: permissions.map((permissionCode) => ({ permissionCode })) } },
      include: { permissions: true, _count: { select: { users: true } } },
    });
  });
  await getAuditRepository().create({ actorUserId: user.id, action: "access_role_updated", targetType: "access-role", targetId: role.id, metadata: { code: role.code, beforePermissionCount: existing.permissions.length, afterPermissionCount: permissions.length } });
  return mapRole(role);
}

export async function assignAdminAccessRole(user: AuthUser, userId: string, roleId: unknown) {
  requireSuperAdmin(user);
  if (user.id === userId) throw new ValidationApiError("نقش حساب خودتان را نمی‌توانید تغییر دهید.");
  if (typeof roleId !== "string" || !UUID_PATTERN.test(roleId)) throw new ValidationApiError("نقش انتخاب‌شده معتبر نیست.");
  const prisma = getPrismaClient();
  const [target, role] = await Promise.all([
    getUserRepository().findById(userId),
    prisma.accessRole.findUnique({ where: { id: roleId } }),
  ]);
  if (!target) throw new NotFoundApiError("کاربر پیدا نشد.");
  if (!role) throw new NotFoundApiError("نقش پیدا نشد.");
  if (target.role === "super-admin" && role.code !== "super-admin") {
    const count = await prisma.user.count({ where: { accessRole: { code: "super-admin" } } });
    if (count <= 1) throw new ValidationApiError("آخرین مدیر ارشد سیستم قابل تنزل نقش نیست.");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { accessRoleId: role.id, systemRole: role.systemRole ?? SystemRole.USER },
  });
  const updated = await getUserRepository().findById(userId);
  if (!updated) throw new NotFoundApiError("کاربر پیدا نشد.");
  await getAuditRepository().create({ actorUserId: user.id, action: "user_role_changed", targetType: "user", targetId: userId, metadata: { beforeRole: target.accessRole.code, afterRole: role.code } });
  return updated;
}
