export function safeAuthReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  if (value.includes("\\") || /[\u0000-\u001f]/.test(value)) {
    return null;
  }

  return value;
}
