import type { AuthUser } from "@/server/auth/auth-types";
import { requireBusinessActive } from "@/server/business/business-access";
import { getCurrentBusinessContext } from "@/server/business/business-service";
import {
  ForbiddenApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import { getContentGeneratorRepository } from "@/server/repositories/repository-provider";
import { decryptSecret, encryptSecret } from "@/server/security/secret-crypto";
import type {
  ContentGeneratorSettings,
  ContentGeneratorSettingsRecord,
} from "@/server/content-generator/content-generator-types";

const SERVICE_ID = "content-generator";

async function getBusinessId(user: AuthUser) {
  const context = requireBusinessActive(
    await getCurrentBusinessContext(user),
  );
  const assignment = context.services.find(
    (item) => item.serviceId === SERVICE_ID,
  );

  if (!assignment) {
    throw new ForbiddenApiError(
      "تولید محتوای هوشمند برای این کسب‌وکار فعال نشده است.",
    );
  }

  if (["paused", "coming-soon"].includes(assignment.status)) {
    throw new ForbiddenApiError(
      "تولید محتوای هوشمند در حال حاضر قابل استفاده نیست.",
    );
  }

  return context.business.id;
}

function decryptText(value: string | null) {
  if (!value) return null;
  try {
    return decryptSecret(value);
  } catch {
    return null;
  }
}

function decryptList(value: string | null) {
  const decrypted = decryptText(value);
  if (!decrypted) return [];

  try {
    const parsed = JSON.parse(decrypted) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function toSettings(
  record: ContentGeneratorSettingsRecord,
): ContentGeneratorSettings {
  const targetSiteUrl = decryptText(record.targetSiteUrlEncrypted);
  const apiKeyConfigured = Boolean(record.apiKeyEncrypted);
  const secretKeyConfigured = Boolean(record.secretKeyEncrypted);

  return {
    keywords: decryptList(record.keywordsEncrypted),
    sourceUrls: decryptList(record.sourceUrlsEncrypted),
    targetSiteUrl,
    apiKeyConfigured,
    secretKeyConfigured,
    connectionConfigured: Boolean(
      targetSiteUrl && apiKeyConfigured && secretKeyConfigured,
    ),
    updatedAt: record.updatedAt,
  };
}

function normalizeStrings(
  value: unknown,
  label: string,
  maxItems: number,
  maxLength: number,
) {
  if (!Array.isArray(value)) {
    throw new ValidationApiError(`${label} معتبر نیست.`);
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  const unique = [...new Set(items)];

  if (unique.length === 0) {
    throw new ValidationApiError(`حداقل یک ${label} وارد کنید.`);
  }

  if (unique.length > maxItems) {
    throw new ValidationApiError(
      `حداکثر ${maxItems.toLocaleString("fa-IR")} ${label} قابل ثبت است.`,
    );
  }

  if (unique.some((item) => item.length > maxLength)) {
    throw new ValidationApiError(`${label} بیش از حد طولانی است.`);
  }

  return unique;
}

function normalizeUrl(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationApiError(`${label} را وارد کنید.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new ValidationApiError(`${label} معتبر نیست.`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ValidationApiError(`${label} باید با http یا https شروع شود.`);
  }

  if (parsed.username || parsed.password) {
    throw new ValidationApiError(`${label} نباید شامل نام کاربری یا رمز عبور باشد.`);
  }

  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

function normalizeSecret(value: unknown, label: string) {
  if (typeof value !== "string") return null;
  const secret = value.trim();
  if (!secret) return null;

  if (secret.length < 8 || secret.length > 2048) {
    throw new ValidationApiError(
      `${label} باید بین ۸ تا ۲۰۴۸ کاراکتر باشد.`,
    );
  }

  return secret;
}

export async function getContentGeneratorSettings(user: AuthUser) {
  const businessId = await getBusinessId(user);
  const record =
    await getContentGeneratorRepository().getSettings(businessId);
  return { settings: toSettings(record) };
}

export async function saveContentGeneratorSettings(
  user: AuthUser,
  body: Record<string, unknown>,
) {
  const businessId = await getBusinessId(user);
  const repository = getContentGeneratorRepository();
  const current = await repository.getSettings(businessId);
  const keywords = normalizeStrings(body.keywords, "کلمه کلیدی", 30, 120);
  const rawSourceUrls = normalizeStrings(body.sourceUrls, "آدرس منبع", 20, 2048);
  const sourceUrls = rawSourceUrls.map((url) =>
    normalizeUrl(url, "آدرس منبع"),
  );
  const targetSiteUrl = normalizeUrl(body.targetSiteUrl, "آدرس سایت مقصد");
  const apiKey = normalizeSecret(body.apiKey, "API Key");
  const secretKey = normalizeSecret(body.secretKey, "Secret Key");

  if (!apiKey && !current.apiKeyEncrypted) {
    throw new ValidationApiError("API Key را وارد کنید.");
  }

  if (!secretKey && !current.secretKeyEncrypted) {
    throw new ValidationApiError("Secret Key را وارد کنید.");
  }

  const updated = await repository.updateSettings(businessId, {
    keywordsEncrypted: encryptSecret(JSON.stringify(keywords)),
    sourceUrlsEncrypted: encryptSecret(JSON.stringify(sourceUrls)),
    targetSiteUrlEncrypted: encryptSecret(targetSiteUrl),
    ...(apiKey ? { apiKeyEncrypted: encryptSecret(apiKey) } : {}),
    ...(secretKey ? { secretKeyEncrypted: encryptSecret(secretKey) } : {}),
  });

  return { settings: toSettings(updated) };
}
