const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "xlsx",
  "xls",
];

export type FileValidationResult = {
  valid: boolean;
  message?: string;
};

export function validateExcelFile(
  file: File
): FileValidationResult {
  const extension =
    file.name.split(".").pop()?.toLowerCase();

  if (
    !extension ||
    !ALLOWED_EXTENSIONS.includes(extension)
  ) {
    return {
      valid: false,
      message:
        "فقط فایل‌های Excel (.xlsx و .xls) مجاز هستند.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message:
        "حجم فایل نباید بیشتر از 20MB باشد.",
    };
  }

  return {
    valid: true,
  };
}