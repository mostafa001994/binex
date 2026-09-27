import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function getEncryptionKey(): Buffer {
  const configured = process.env.BINIX_CREDENTIALS_ENCRYPTION_KEY;

  if (configured) {
    const decoded = Buffer.from(configured, "base64");

    if (decoded.length !== 32) {
      throw new Error(
        "BINIX_CREDENTIALS_ENCRYPTION_KEY must be a base64-encoded 32-byte key.",
      );
    }

    return decoded;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "BINIX_CREDENTIALS_ENCRYPTION_KEY is required in production.",
    );
  }

  // Development-only fallback so mock mode remains easy to run locally.
  // Production never uses this fallback.
  return createHash("sha256")
    .update("binix-local-development-credential-key")
    .digest();
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptSecret(payload: string): string {
  const [version, ivB64, authTagB64, encryptedB64] =
    payload.split(".");

  if (
    version !== "v1" ||
    !ivB64 ||
    !authTagB64 ||
    !encryptedB64
  ) {
    throw new Error("Encrypted secret payload is invalid.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivB64, "base64"),
  );

  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedB64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
