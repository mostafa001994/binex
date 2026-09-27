import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { ConflictApiError, ValidationApiError } from "@/server/core/api-error";
import { getDataDriver } from "@/server/config/data-driver";
import { getPrismaClient } from "@/server/db/prisma";
import { createDatabaseAuditLog } from "@/server/repositories/database/database-audit-repository";
import {
  findManagedFaqPage,
  managedFaqPages,
  type FaqContentItem,
} from "@/lib/managed-faq-pages";

const MAX_ITEMS_PER_PAGE = 30;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requiredText(value: unknown, label: string, max: number) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationApiError(`${label} الزامی است.`);
  }
  const normalized = value.trim();
  if (normalized.length > max) {
    throw new ValidationApiError(
      `${label} باید حداکثر ${max.toLocaleString("fa-IR")} نویسه باشد.`,
    );
  }
  return normalized;
}

function parseItems(value: unknown) {
  if (!Array.isArray(value)) {
    throw new ValidationApiError("فهرست سوالات معتبر نیست.");
  }
  if (value.length > MAX_ITEMS_PER_PAGE) {
    throw new ValidationApiError(
      `در هر صفحه حداکثر ${MAX_ITEMS_PER_PAGE.toLocaleString("fa-IR")} سوال مجاز است.`,
    );
  }

  const items = value.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new ValidationApiError(`سوال شماره ${index + 1} معتبر نیست.`);
    }
    const item = raw as Record<string, unknown>;
    return {
      id:
        typeof item.id === "string" && UUID_PATTERN.test(item.id)
          ? item.id
          : randomUUID(),
      question: requiredText(item.question, `عنوان سوال شماره ${index + 1}`, 300),
      answer: requiredText(item.answer, `پاسخ سوال شماره ${index + 1}`, 2000),
      isActive: item.isActive !== false,
      sortOrder: index,
    };
  });

  const normalizedQuestions = items.map((item) =>
    item.question.toLocaleLowerCase("fa-IR"),
  );
  if (new Set(normalizedQuestions).size !== normalizedQuestions.length) {
    throw new ValidationApiError("سوال تکراری در این صفحه وجود دارد.");
  }
  return items;
}

export async function getPublicFaqItems(
  pagePath: string,
): Promise<FaqContentItem[]> {
  const managedPage = findManagedFaqPage(pagePath);
  if (!managedPage) return [];
  if (getDataDriver() !== "database") return managedPage.fallbackItems;

  try {
    return await getPrismaClient().faqItem.findMany({
      where: { pagePath, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { question: true, answer: true },
    });
  } catch {
    // Public pages stay usable while the database is briefly unavailable.
    return managedPage.fallbackItems;
  }
}

export async function listAdminFaqPages(user: AuthUser) {
  requireAdminPermission(user, "admin.content.read");
  const pagePaths = managedFaqPages.map((page) => page.path);
  const [items, states] = await Promise.all([
    getPrismaClient().faqItem.findMany({
      where: { pagePath: { in: pagePaths } },
      orderBy: [{ pagePath: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    getPrismaClient().faqPageState.findMany({ where: { path: { in: pagePaths } } }),
  ]);
  const stateByPath = new Map(states.map((state) => [state.path, state]));

  return {
    pages: managedFaqPages.map((page) => ({
      path: page.path,
      label: page.label,
      version: stateByPath.get(page.path)?.version ?? 1,
      items: items
        .filter((item) => item.pagePath === page.path)
        .map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        })),
    })),
  };
}

export async function updateAdminFaqPage(
  user: AuthUser,
  body: Record<string, unknown>,
) {
  requireAdminPermission(user, "admin.content.write");
  const pagePath = typeof body.pagePath === "string" ? body.pagePath : "";
  const managedPage = findManagedFaqPage(pagePath);
  if (!managedPage) {
    throw new ValidationApiError("صفحه انتخاب‌شده قابل مدیریت نیست.");
  }
  const items = parseItems(body.items);
  const expectedVersion = Number(body.version);
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
    throw new ValidationApiError("نسخه FAQ معتبر نیست؛ صفحه را تازه‌سازی کنید.");
  }

  await getPrismaClient().$transaction(async (tx) => {
    await tx.faqPageState.upsert({
      where: { path: pagePath },
      update: {},
      create: { path: pagePath },
    });
    const claim = await tx.faqPageState.updateMany({
      where: { path: pagePath, version: expectedVersion },
      data: { version: { increment: 1 } },
    });
    if (!claim.count) {
      throw new ConflictApiError(
        "سوالات این صفحه هم‌زمان در جای دیگری تغییر کرده‌اند؛ صفحه را تازه‌سازی کنید.",
      );
    }
    await tx.faqItem.deleteMany({ where: { pagePath } });
    if (items.length) {
      await tx.faqItem.createMany({
        data: items.map((item) => ({ ...item, pagePath })),
      });
    }
    await createDatabaseAuditLog(tx, {
      actorUserId: user.id,
      action: "faq_settings_updated",
      targetType: "faq-page",
      targetId: pagePath,
      metadata: {
        path: pagePath,
        itemCount: items.length,
        activeItemCount: items.filter((item) => item.isActive).length,
      },
    });
  });

  revalidatePath(pagePath);
  return {
    path: pagePath,
    label: managedPage.label,
    version: expectedVersion + 1,
    items: items.map(({ id, question, answer, sortOrder, isActive }) => ({
      id,
      question,
      answer,
      sortOrder,
      isActive,
    })),
  };
}
