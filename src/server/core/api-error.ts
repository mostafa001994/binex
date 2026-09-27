import type { ApiFieldErrors } from "@/types/api/common";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: ApiFieldErrors;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: ApiFieldErrors,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export class ValidationApiError extends ApiError {
  constructor(
    message = "اطلاعات ارسال‌شده معتبر نیست.",
    fields?: ApiFieldErrors,
  ) {
    super(422, "VALIDATION_ERROR", message, fields);
  }
}

export class UnauthorizedApiError extends ApiError {
  constructor(message = "برای ادامه باید وارد حساب شوید.") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenApiError extends ApiError {
  constructor(message = "دسترسی به این بخش مجاز نیست.") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundApiError extends ApiError {
  constructor(message = "منبع موردنظر پیدا نشد.") {
    super(404, "NOT_FOUND", message);
  }
}


export class ConflictApiError extends ApiError {
  constructor(
    message = "این عملیات با وضعیت فعلی منبع تداخل دارد.",
    fields?: ApiFieldErrors,
  ) {
    super(409, "CONFLICT", message, fields);
  }
}
