import { ValidationApiError } from "@/server/core/api-error";

export function normalizeIranPhone(value: unknown) {
  if (typeof value !== "string") {
    throw new ValidationApiError("شماره موبایل معتبر نیست.", {
      phone: ["شماره موبایل الزامی است."],
    });
  }

  const digits = value.replace(/\D/g, "");
  const normalized =
    digits.startsWith("98") && digits.length === 12
      ? `0${digits.slice(2)}`
      : digits;

  if (!/^09\d{9}$/.test(normalized)) {
    throw new ValidationApiError("شماره موبایل معتبر نیست.", {
      phone: ["شماره را به شکل 09xxxxxxxxx وارد کنید."],
    });
  }

  return normalized;
}

export function normalizeOtpCode(value: unknown) {
  if (typeof value !== "string") {
    throw new ValidationApiError("کد تأیید معتبر نیست.", {
      code: ["کد تأیید الزامی است."],
    });
  }

  const code = value.replace(/\D/g, "");

  if (!/^\d{5}$/.test(code)) {
    throw new ValidationApiError("کد تأیید معتبر نیست.", {
      code: ["کد باید ۵ رقمی باشد."],
    });
  }

  return code;
}
