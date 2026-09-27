import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import {
  ConflictApiError,
  NotFoundApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import {
  getAuditRepository,
  getBusinessRepository,
  getBusinessServiceRepository,
  getServiceCatalogRepository,
} from "@/server/repositories/repository-provider";
import type {
  CreateServiceDefinitionInput,
  UpdateServiceDefinitionInput,
} from "@/server/repositories/contracts/service-catalog-repository";
import type { IconKey } from "@/constants/icon-registry";
import { normalizeServiceMarketingContent } from "@/types/service-marketing";

const allowedIcons = new Set<IconKey>([
  "activity",
  "bar-chart",
  "bell",
  "bell-ring",
  "book",
  "bot",
  "calendar",
  "calendar-days",
  "check-circle",
  "clock",
  "credit-card",
  "dashboard",
  "file-search",
  "file-spreadsheet",
  "file-warning",
  "gauge",
  "home",
  "layout-grid",
  "key",
  "line-chart",
  "list-checks",
  "message",
  "message-more",
  "package",
  "package-search",
  "search",
  "settings",
  "shopping-bag",
  "cart",
  "sparkles",
  "upload",
  "user",
  "users",
  "wallet",
  "zap",
]);

function cleanId(value: unknown) {
  const id = String(
    value ?? "",
  )
    .trim()
    .toLowerCase();

  if (
    !/^[a-z0-9][a-z0-9-]{1,62}$/.test(
      id,
    )
  ) {
    throw new ValidationApiError(
      "شناسه سرویس باید انگلیسی، کوچک و شامل حروف، عدد یا خط تیره باشد.",
    );
  }

  return id;
}

function cleanSlug(value: unknown) {
  return cleanId(value);
}

function cleanText(
  value: unknown,
  label: string,
  max = 500,
) {
  const text = String(
    value ?? "",
  ).trim();

  if (!text) {
    throw new ValidationApiError(
      `${label} الزامی است.`,
    );
  }

  if (text.length > max) {
    throw new ValidationApiError(
      `${label} بیش از حد طولانی است.`,
    );
  }

  return text;
}

const builtInMarketingPaths:
  Record<string, string> = {
    "sales-agent":
      "/services/ai-sales-agent",
    "smart-booking":
      "/services/smart-booking",
    "excel-analyzer":
      "/services/excel-analyzer",
    bi: "/services/bi-modules",
    "content-generator":
      "/services/ai-content",
  };

const builtInAppPaths:
  Record<string, string> = {
    "sales-agent":
      "/app/services/sales-agent",
    "smart-booking":
      "/app/services/booking",
    "excel-analyzer":
      "/app/services/excel",
    bi: "/app/services/bi",
    "content-generator":
      "/app/services/content-generator",
  };

function cleanMarketingPath(
  value: unknown,
  id: string,
  slug: string,
) {
  const text = String(
    value ?? "",
  ).trim();

  const generic =
    `/services/${slug}`;
  const builtIn =
    builtInMarketingPaths[id];

  if (!text) {
    return builtIn ?? generic;
  }

  if (
    text !== generic &&
    text !== builtIn
  ) {
    throw new ValidationApiError(
      "مسیر عمومی سرویس باید مسیر اختصاصی ثبت‌شده یا /services/{slug} باشد.",
    );
  }

  return text;
}

function cleanAppPath(
  value: unknown,
  id: string,
) {
  const text = String(
    value ?? "",
  ).trim();

  if (!text) {
    return null;
  }

  const generic =
    `/app/services/${id}`;
  const builtIn =
    builtInAppPaths[id];

  if (
    text !== generic &&
    text !== builtIn
  ) {
    throw new ValidationApiError(
      "مسیر پنل باید Workspace اختصاصی ثبت‌شده یا /app/services/{serviceId} باشد.",
    );
  }

  return text;
}

function cleanFeatures(
  value: unknown,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      String(item).trim(),
    )
    .filter(Boolean)
    .slice(0, 12);
}

function cleanMarketingContent(
  value: unknown,
  fallback: {
    name: string;
    category: string;
    description: string;
    features: string[];
  },
) {
  if (JSON.stringify(value ?? {}).length > 50_000) {
    throw new ValidationApiError(
      "محتوای صفحه سرویس بیش از حد بزرگ است.",
    );
  }

  const content = normalizeServiceMarketingContent(value, fallback);

  if (
    content.hero.imageUrl &&
    !/^\/api\/blog\/media\/[0-9a-f-]{36}$/i.test(content.hero.imageUrl)
  ) {
    throw new ValidationApiError(
      "تصویر Hero باید از کتابخانه رسانه Binix انتخاب شود.",
    );
  }

  if (!/^\/[a-zA-Z0-9/_?=#&.%~-]*$/.test(content.cta.href)) {
    throw new ValidationApiError(
      "لینک دکمه پایانی باید یک مسیر داخلی سایت باشد.",
    );
  }

  return content;
}

function normalizeCreate(
  body: Record<string, unknown>,
): CreateServiceDefinitionInput {
  const id = cleanId(body.id);
  const slug = cleanSlug(
    body.slug || id,
  );

  const availability =
    body.availability ===
    "coming-soon"
      ? "coming-soon"
      : "available";

  const status =
    body.status === "draft" ||
    body.status === "disabled"
      ? body.status
      : "active";

  const visibility =
    body.visibility === "private"
      ? "private"
      : "public";

  const iconKey =
    allowedIcons.has(
      body.iconKey as IconKey,
    )
      ? (body.iconKey as IconKey)
      : "layout-grid";

  const accent =
    String(
      body.accent ||
        "#078BFF",
    ).trim();

  const name = cleanText(
    body.name,
    "نام سرویس",
    100,
  );
  const category = cleanText(
    body.category,
    "دسته‌بندی",
    100,
  );
  const description = cleanText(
    body.description,
    "توضیحات",
    600,
  );
  const features = cleanFeatures(
    body.features,
  );

  return {
    id,
    slug,
    name,
    shortName: cleanText(
      body.shortName ||
        body.name,
      "نام کوتاه",
      70,
    ),
    category,
    description,
    appHref: cleanAppPath(
      body.appHref,
      id,
    ),
    marketingHref:
      cleanMarketingPath(
        body.marketingHref,
        id,
        slug,
      ),
    availability,
    status,
    visibility,
    accent,
    iconKey,
    sortOrder:
      Number.isFinite(
        Number(body.sortOrder),
      )
        ? Number(
            body.sortOrder,
          )
        : 100,
    features,
    marketingContent: cleanMarketingContent(
      body.marketingContent,
      { name, category, description, features },
    ),
  };
}

export async function listAdminServiceCatalog(
  user: AuthUser,
) {
  requireAdminPermission(
    user,
    "admin.catalog.read",
  );

  return getServiceCatalogRepository().list();
}

export async function createAdminServiceCatalogItem(
  user: AuthUser,
  body: Record<string, unknown>,
) {
  requireAdminPermission(
    user,
    "admin.catalog.manage",
  );

  const input =
    normalizeCreate(body);

  const repository =
    getServiceCatalogRepository();

  if (
    await repository.findById(
      input.id,
    )
  ) {
    throw new ConflictApiError(
      "شناسه سرویس قبلاً استفاده شده است.",
    );
  }

  if (
    await repository.findBySlug(
      input.slug,
    )
  ) {
    throw new ConflictApiError(
      "Slug سرویس قبلاً استفاده شده است.",
    );
  }

  const service =
    await repository.create(
      input,
    );

  await getAuditRepository().create({
    actorUserId: user.id,
    action:
      "service_catalog_created",
    targetType:
      "service-catalog",
    targetId: service.id,
    metadata: {
      name: service.name,
      slug: service.slug,
      status: service.status,
      visibility:
        service.visibility,
    },
  });

  return service;
}

export async function updateAdminServiceCatalogItem(
  user: AuthUser,
  serviceId: string,
  body: Record<string, unknown>,
) {
  requireAdminPermission(
    user,
    "admin.catalog.manage",
  );

  const repository =
    getServiceCatalogRepository();

  const before =
    await repository.findById(
      serviceId,
    );

  if (!before) {
    throw new NotFoundApiError(
      "سرویس پیدا نشد.",
    );
  }

  const nextInput =
    normalizeCreate({
      ...before,
      ...body,
      id: before.id,
    });

  const slugOwner =
    await repository.findBySlug(
      nextInput.slug,
    );

  if (
    slugOwner &&
    slugOwner.id !==
      serviceId
  ) {
    throw new ConflictApiError(
      "Slug سرویس قبلاً استفاده شده است.",
    );
  }

  const update: UpdateServiceDefinitionInput =
    {
      slug: nextInput.slug,
      name: nextInput.name,
      shortName:
        nextInput.shortName,
      category:
        nextInput.category,
      description:
        nextInput.description,
      appHref:
        nextInput.appHref,
      marketingHref:
        nextInput.marketingHref,
      availability:
        nextInput.availability,
      status:
        nextInput.status,
      visibility:
        nextInput.visibility,
      accent:
        nextInput.accent,
      iconKey:
        nextInput.iconKey,
      sortOrder:
        nextInput.sortOrder,
      features:
        nextInput.features,
      marketingContent:
        nextInput.marketingContent,
    };

  const service =
    await repository.update(
      serviceId,
      update,
    );

  if (!service) {
    throw new NotFoundApiError(
      "سرویس پیدا نشد.",
    );
  }

  await getAuditRepository().create({
    actorUserId: user.id,
    action:
      "service_catalog_updated",
    targetType:
      "service-catalog",
    targetId: service.id,
    metadata: {
      beforeStatus:
        before.status,
      afterStatus:
        service.status,
      beforeVisibility:
        before.visibility,
      afterVisibility:
        service.visibility,
      beforeSlug:
        before.slug,
      afterSlug:
        service.slug,
    },
  });

  return service;
}

export async function deleteAdminServiceCatalogItem(
  user: AuthUser,
  serviceId: string,
) {
  requireAdminPermission(
    user,
    "admin.catalog.manage",
  );

  const repository =
    getServiceCatalogRepository();

  const service =
    await repository.findById(
      serviceId,
    );

  if (!service) {
    throw new NotFoundApiError(
      "سرویس پیدا نشد.",
    );
  }

  const businesses =
    await getBusinessRepository().list();

  for (
    const business of businesses
  ) {
    const assigned =
      await getBusinessServiceRepository().listByBusinessId(
        business.id,
      );

    if (
      assigned.some(
        (item) =>
          item.serviceId ===
          serviceId,
      )
    ) {
      throw new ConflictApiError(
        "این سرویس به حداقل یک کسب‌وکار تخصیص داده شده و قابل حذف نیست. ابتدا تخصیص‌ها را حذف کنید.",
      );
    }
  }

  const deleted =
    await repository.delete(
      serviceId,
    );

  if (!deleted) {
    throw new NotFoundApiError(
      "سرویس پیدا نشد.",
    );
  }

  await getAuditRepository().create({
    actorUserId: user.id,
    action:
      "service_catalog_deleted",
    targetType:
      "service-catalog",
    targetId: service.id,
    metadata: {
      name: service.name,
      slug: service.slug,
    },
  });
}
