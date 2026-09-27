import type {
  AuditActionValue,
  AuditTargetType,
} from "@/lib/audit";

export type AuditAction = AuditActionValue;

export type AuditLog = {
  id: string;
  actorUserId: string;
  actor: {
    phone: string;
    name: string | null;
  } | null;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string | null;
  metadata: Record<string, string | number | boolean | null>;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

const SENSITIVE_METADATA_KEY =
  /password|secret|token|credential|authorization|cookie|api[-_]?key/i;

export function sanitizeAuditMetadata(
  metadata: AuditLog["metadata"],
): AuditLog["metadata"] {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      SENSITIVE_METADATA_KEY.test(key) ? "[REDACTED]" : value,
    ]),
  );
}
