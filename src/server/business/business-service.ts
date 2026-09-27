import { getDataDriver } from "@/server/config/data-driver";
import type {
  CurrentBusinessContext,
} from "@/server/business/business-types";
import {
  getAuditRepository,
  getBusinessMemberRepository,
  getBusinessRepository,
  getBusinessServiceRepository,
  getUserRepository,
} from "@/server/repositories/repository-provider";
import {
  ConflictApiError,
  ForbiddenApiError,
  NotFoundApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import { requireBusinessActive } from "@/server/business/business-access";

async function seedBusinessForUser(userId: string, phone: string) {
  const businessRepository = getBusinessRepository();
  const memberRepository = getBusinessMemberRepository();
  const business = await businessRepository.create({
    name: "کسب‌وکار من",
    phone,
    category: null,
  });

  const membership = await memberRepository.create({
    businessId: business.id,
    userId,
    role: "owner",
  });

  // Service ownership is explicit. A new Business starts with
  // no assigned services; Admin/purchase flows assign them later.
  const services: CurrentBusinessContext["services"] = [];

  return {
    dataMode: getDataDriver(),
    business,
    membership,
    services,
  } satisfies CurrentBusinessContext;
}

export async function getCurrentBusinessContext(
  user: { id: string; phone: string },
): Promise<CurrentBusinessContext> {
  const memberRepository = getBusinessMemberRepository();
  const businessRepository = getBusinessRepository();
  const serviceRepository = getBusinessServiceRepository();

  const membership = await memberRepository.findPrimaryByUserId(user.id);

  if (!membership) {
    return seedBusinessForUser(user.id, user.phone);
  }

  const business = await businessRepository.findById(
    membership.businessId,
  );

  if (!business) {
    throw new NotFoundApiError("کسب‌وکار مرتبط با حساب پیدا نشد.");
  }

  const services = await serviceRepository.listByBusinessId(
    business.id,
  );

  return {
    dataMode: getDataDriver(),
    business,
    membership,
    services,
  };
}

export async function listCurrentBusinessMembers(
  user: { id: string; phone: string },
) {
  const context = requireBusinessActive(await getCurrentBusinessContext(user));
  const members = await getBusinessMemberRepository().listByBusinessId(
    context.business.id,
  );
  const users = await Promise.all(
    members.map((member) => getUserRepository().findById(member.userId)),
  );

  return {
    business: context.business,
    access: { canManage: context.membership.role === "owner" },
    members: members.map((member, index) => ({
      ...member,
      user: {
        name: users[index]?.name ?? null,
        phone: users[index]?.phone ?? "—",
      },
      isCurrentUser: member.userId === user.id,
    })),
  };
}

function requireBusinessOwner(role: CurrentBusinessContext["membership"]["role"]) {
  if (role !== "owner") {
    throw new ForbiddenApiError("فقط مالک کسب‌وکار می‌تواند اعضای تیم را مدیریت کند.");
  }
}

function parseMemberRole(value: unknown) {
  if (value !== "admin" && value !== "member") {
    throw new ValidationApiError("نقش عضو معتبر نیست.", {
      role: ["نقش باید مدیر کسب‌وکار یا عضو باشد."],
    });
  }
  return value;
}

export async function addCurrentBusinessMember(
  actor: { id: string; phone: string },
  body: Record<string, unknown>,
) {
  const context = requireBusinessActive(await getCurrentBusinessContext(actor));
  requireBusinessOwner(context.membership.role);
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const role = parseMemberRole(body.role);

  if (!/^09\d{9}$/.test(phone)) {
    throw new ValidationApiError("شماره موبایل معتبر نیست.", {
      phone: ["شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد."],
    });
  }

  const targetUser = await getUserRepository().findByPhone(phone);
  if (!targetUser) {
    throw new NotFoundApiError("این شماره هنوز حساب Binix ندارد؛ کاربر باید ابتدا یک‌بار وارد سامانه شود.");
  }
  if (targetUser.status !== "active") {
    throw new ConflictApiError("حساب این کاربر فعال نیست و امکان افزودن آن وجود ندارد.");
  }
  if (targetUser.id === actor.id) {
    throw new ConflictApiError("شما از قبل مالک این کسب‌وکار هستید.");
  }

  const existingMembership = await getBusinessMemberRepository().findPrimaryByUserId(targetUser.id);
  if (existingMembership) {
    throw new ConflictApiError(
      existingMembership.businessId === context.business.id
        ? "این کاربر از قبل عضو کسب‌وکار است."
        : "این کاربر در حال حاضر عضو کسب‌وکار دیگری است.",
    );
  }

  await getBusinessMemberRepository().create({
    businessId: context.business.id,
    userId: targetUser.id,
    role,
  });
  await getAuditRepository().create({
    actorUserId: actor.id,
    action: "business_member_added",
    targetType: "user",
    targetId: targetUser.id,
    metadata: { businessId: context.business.id, userId: targetUser.id, role },
  });

  return listCurrentBusinessMembers(actor);
}

async function ownedMember(actor: { id: string; phone: string }, memberId: string) {
  const context = requireBusinessActive(await getCurrentBusinessContext(actor));
  requireBusinessOwner(context.membership.role);
  const members = await getBusinessMemberRepository().listByBusinessId(context.business.id);
  const member = members.find((item) => item.id === memberId);
  if (!member) throw new NotFoundApiError("عضو موردنظر پیدا نشد.");
  if (member.role === "owner" || member.userId === actor.id) {
    throw new ConflictApiError("نقش یا عضویت مالک از این بخش قابل تغییر نیست.");
  }
  return { context, member };
}

export async function updateCurrentBusinessMember(
  actor: { id: string; phone: string },
  memberId: string,
  body: Record<string, unknown>,
) {
  const { context, member } = await ownedMember(actor, memberId);
  const role = parseMemberRole(body.role);
  const updated = await getBusinessMemberRepository().updateRole(member.id, role);
  if (!updated) throw new NotFoundApiError("عضو موردنظر پیدا نشد.");

  await getAuditRepository().create({
    actorUserId: actor.id,
    action: "user_role_changed",
    targetType: "user",
    targetId: member.userId,
    metadata: { businessId: context.business.id, userId: member.userId, beforeRole: member.role, afterRole: role },
  });
  return listCurrentBusinessMembers(actor);
}

export async function removeCurrentBusinessMember(
  actor: { id: string; phone: string },
  memberId: string,
) {
  const { context, member } = await ownedMember(actor, memberId);
  if (!(await getBusinessMemberRepository().remove(member.id))) {
    throw new NotFoundApiError("عضو موردنظر پیدا نشد.");
  }
  await getAuditRepository().create({
    actorUserId: actor.id,
    action: "business_member_removed",
    targetType: "user",
    targetId: member.userId,
    metadata: { businessId: context.business.id, userId: member.userId, role: member.role },
  });
  return listCurrentBusinessMembers(actor);
}
