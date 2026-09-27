export type OtpDriver = "mock" | "sms";

export const AUTH_COOKIE_NAME =
  process.env.BINIX_SESSION_COOKIE_NAME || "binix_session";

export const OTP_LENGTH = 5;
export const OTP_TTL_SECONDS = 120;
export const OTP_RESEND_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;
export const SESSION_TTL_DAYS = Number(
  process.env.BINIX_SESSION_TTL_DAYS || "30",
);

export function getOtpDriver(): OtpDriver {
  const value = process.env.BINIX_OTP_DRIVER?.trim().toLowerCase();

  if (!value || value === "mock") return "mock";
  if (value === "sms") return "sms";

  throw new Error(
    `Unsupported BINIX_OTP_DRIVER="${process.env.BINIX_OTP_DRIVER}"`,
  );
}
