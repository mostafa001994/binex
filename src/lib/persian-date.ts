const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const persianCalendarFormatter = new Intl.DateTimeFormat(
  "en-US-u-ca-persian",
  {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
);

const auditDateTimeFormatter = new Intl.DateTimeFormat(
  "fa-IR-u-ca-persian",
  {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  },
);

export function normalizePersianNumber(value: string) {
  return Array.from(value)
    .map((character) => {
      const persianIndex = PERSIAN_DIGITS.indexOf(character);
      if (persianIndex >= 0) return String(persianIndex);

      const arabicIndex = ARABIC_DIGITS.indexOf(character);
      return arabicIndex >= 0 ? String(arabicIndex) : character;
    })
    .join("");
}

function persianParts(date: Date) {
  const parts = persianCalendarFormatter.formatToParts(date);
  const numberPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: numberPart("year"),
    month: numberPart("month"),
    day: numberPart("day"),
  };
}

export function persianDateToGregorian(value: string) {
  const normalized = normalizePersianNumber(value.trim()).replace(/[-.]/g, "/");
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(normalized);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1200 || year > 1600 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const start = Date.UTC(year + 620, 0, 1);
  const end = Date.UTC(year + 623, 0, 1);

  for (let timestamp = start; timestamp < end; timestamp += 86_400_000) {
    const date = new Date(timestamp);
    const parts = persianParts(date);

    if (parts.year === year && parts.month === month && parts.day === day) {
      const gregorianYear = date.getUTCFullYear();
      const gregorianMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
      const gregorianDay = String(date.getUTCDate()).padStart(2, "0");
      return `${gregorianYear}-${gregorianMonth}-${gregorianDay}`;
    }
  }

  return null;
}

export function persianDateToTehranIso(value: string, endOfDay = false) {
  if (!value.trim()) return "";

  const gregorian = persianDateToGregorian(value);
  if (!gregorian) return null;

  const time = endOfDay ? "23:59:59.999" : "00:00:00.000";
  return new Date(`${gregorian}T${time}+03:30`).toISOString();
}

export function formatTehranPersianDateTime(value: string) {
  return auditDateTimeFormatter.format(new Date(value));
}
