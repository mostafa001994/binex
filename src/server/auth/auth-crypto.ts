import { createHash, randomBytes } from "node:crypto";

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createOpaqueToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}
