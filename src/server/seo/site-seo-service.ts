import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import type { AuthUser } from "@/server/auth/auth-types";
import { hasAdminPermission } from "@/server/admin/admin-permissions";
import {
  ConflictApiError,
  ForbiddenApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { createDatabaseAuditLog } from "@/server/repositories/database/database-audit-repository";
import { createPageMetadata } from "@/lib/seo";
import {
  findManagedSeoPage,
  managedSeoPages,
} from "@/lib/managed-seo-pages";
import { siteConfig } from "@/lib/site-config";

function requireSeoRead(user: AuthUser) {
  if (
    !hasAdminPermission(
      user.permissions,
      "admin.content.read",
    )
  ) {
    throw new ForbiddenApiError(
      "دسترسی مشاهده تنظیمات SEO برای این حساب مجاز نیست.",
    );
  }
}

function requireSeoWrite(user: AuthUser) {
  if (
    !hasAdminPermission(
      user.permissions,
      "admin.content.write",
    )
  ) {
    throw new ForbiddenApiError(
      "دسترسی ویرایش تنظیمات SEO برای این حساب مجاز نیست.",
    );
  }
}

function optionalText(
  value: unknown,
  label: string,
  max: number,
) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationApiError(
      `${label} معتبر نیست.`,
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > max) {
    throw new ValidationApiError(
      `${label} باید حداکثر ${max.toLocaleString(
        "fa-IR",
      )} نویسه باشد.`,
    );
  }

  return normalized;
}

function requiredText(value: unknown, label: string, max: number) {
  const normalized = optionalText(value, label, max);
  if (!normalized) throw new ValidationApiError(`${label} الزامی است.`);
  return normalized;
}

function optionalUrl(
  value: unknown,
  label: string,
) {
  const normalized = optionalText(
    value,
    label,
    2048,
  );

  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith("/") &&
    !normalized.startsWith("//")
  ) {
    return normalized;
  }

  try {
    const url = new URL(normalized);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      throw new Error();
    }

    return url.toString();
  } catch {
    throw new ValidationApiError(
      `${label} باید مسیر داخلی یا URL معتبر HTTP/HTTPS باشد.`,
    );
  }
}

export async function getManagedSeoMetadata(
  path: string,
): Promise<Metadata> {
  const defaults = findManagedSeoPage(path);

  if (!defaults) {
    throw new Error(
      `SEO page is not managed: ${path}`,
    );
  }

  let setting: {
    title: string | null;
    description: string | null;
    canonicalUrl: string | null;
    ogImageUrl: string | null;
    ogImageAlt: string | null;
    noIndex: boolean;
  } | null = null;

  if (
    process.env.BINIX_DATA_DRIVER ===
    "database"
  ) {
    try {
      setting =
        await getPrismaClient().siteSeoSetting.findUnique(
          {
            where: {
              path,
            },
          },
        );
    } catch {
      // Public pages keep safe defaults during
      // a transient database issue.
      setting = null;
    }
  }

  return createPageMetadata({
    title:
      setting?.title ||
      defaults.title,
    description:
      setting?.description ||
      defaults.description,
    path:
      setting?.canonicalUrl ||
      path,
    absoluteTitle:
      defaults.absoluteTitle,
    image: setting?.ogImageUrl
      ? {
          url: setting.ogImageUrl,
          alt:
            setting.ogImageAlt ||
            setting.title ||
            defaults.title,
        }
      : undefined,
    robots: setting?.noIndex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  });
}

export async function listAdminSeoSettings(
  user: AuthUser,
) {
  requireSeoRead(user);

  const settings =
    await getPrismaClient().siteSeoSetting.findMany();

  const byPath = new Map(
    settings.map((setting) => [
      setting.path,
      setting,
    ]),
  );

  return {
    pages: managedSeoPages.map(
      (page) => {
        const setting = byPath.get(
          page.path,
        );

        return {
          ...page,
          title:
            setting?.title ??
            page.title,
          description:
            setting?.description ??
            page.description,
          canonicalUrl:
            setting?.canonicalUrl ??
            "",
          ogImageUrl:
            setting?.ogImageUrl ??
            "",
          ogImageAlt:
            setting?.ogImageAlt ??
            "",
          noIndex:
            setting?.noIndex ??
            false,
          overridden:
            Boolean(setting),
          updatedAt:
            setting?.updatedAt.toISOString() ??
            null,
        };
      },
    ),
    environment: {
      publicSiteUrl: siteConfig.url,
      searchConsoleVerificationConfigured:
        Boolean(
          process.env
            .GOOGLE_SITE_VERIFICATION,
        ),
    },
  };
}

export async function updateAdminSeoSetting(
  user: AuthUser,
  body: Record<string, unknown>,
) {
  requireSeoWrite(user);

  const path =
    typeof body.path === "string"
      ? body.path
      : "";

  const defaults =
    findManagedSeoPage(path);

  if (!defaults) {
    throw new ValidationApiError(
      "صفحه انتخاب‌شده قابل مدیریت نیست.",
    );
  }

  const data = {
    title: requiredText(
      body.title,
      "عنوان SEO",
      70,
    ),
    description: requiredText(
      body.description,
      "توضیح SEO",
      170,
    ),
    canonicalUrl: optionalUrl(
      body.canonicalUrl,
      "Canonical URL",
    ),
    ogImageUrl: optionalUrl(
      body.ogImageUrl,
      "تصویر شبکه اجتماعی",
    ),
    ogImageAlt: optionalText(
      body.ogImageAlt,
      "Alt تصویر",
      255,
    ),
    noIndex:
      body.noIndex === true,
    updatedById: user.id,
  };

  const expectedUpdatedAt = body.updatedAt;
  if (expectedUpdatedAt !== null && typeof expectedUpdatedAt !== "string") {
    throw new ValidationApiError("نسخه تنظیمات SEO معتبر نیست؛ صفحه را تازه‌سازی کنید.");
  }
  const expectedDate = typeof expectedUpdatedAt === "string"
    ? new Date(expectedUpdatedAt)
    : null;
  if (expectedDate && Number.isNaN(expectedDate.getTime())) {
    throw new ValidationApiError("نسخه تنظیمات SEO معتبر نیست؛ صفحه را تازه‌سازی کنید.");
  }

  const setting =
    await getPrismaClient().$transaction(
      async (tx) => {
        const current = await tx.siteSeoSetting.findUnique({
          where: { path },
          select: { updatedAt: true },
        });
        let saved;
        if (current) {
          if (!expectedDate) {
            throw new ConflictApiError(
              "تنظیمات این صفحه هم‌زمان در جای دیگری تغییر کرده‌اند؛ صفحه را تازه‌سازی کنید.",
            );
          }
          const claim = await tx.siteSeoSetting.updateMany({
            where: { path, updatedAt: expectedDate },
            data,
          });
          if (!claim.count) {
            throw new ConflictApiError(
              "تنظیمات این صفحه هم‌زمان در جای دیگری تغییر کرده‌اند؛ صفحه را تازه‌سازی کنید.",
            );
          }
          saved = await tx.siteSeoSetting.findUniqueOrThrow({ where: { path } });
        } else {
          if (expectedDate) {
            throw new ConflictApiError(
              "تنظیمات این صفحه حذف یا تغییر کرده است؛ صفحه را تازه‌سازی کنید.",
            );
          }
          saved = await tx.siteSeoSetting.create({ data: { path, ...data } });
        }

        await createDatabaseAuditLog(
          tx,
          {
            actorUserId: user.id,
            action:
              "site_seo_updated",
            targetType:
              "seo-page",
            targetId: path,
            metadata: {
              path,
              noIndex:
                data.noIndex,
            },
          },
        );

        return saved;
      },
    );

  revalidatePath(path);

  return {
    ...setting,
    updatedAt:
      setting.updatedAt.toISOString(),
  };
}

export async function resetAdminSeoSetting(
  user: AuthUser,
  path: string,
) {
  requireSeoWrite(user);

  if (!findManagedSeoPage(path)) {
    throw new ValidationApiError(
      "صفحه انتخاب‌شده قابل مدیریت نیست.",
    );
  }

  await getPrismaClient().$transaction(
    async (tx) => {
      await tx.siteSeoSetting.deleteMany(
        {
          where: {
            path,
          },
        },
      );

      await createDatabaseAuditLog(
        tx,
        {
          actorUserId: user.id,
          action:
            "site_seo_updated",
          targetType:
            "seo-page",
          targetId: path,
          metadata: {
            path,
            reset: true,
          },
        },
      );
    },
  );

  revalidatePath(path);

  return {
    reset: true as const,
  };
}
