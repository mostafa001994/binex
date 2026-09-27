export type DataDriver = "mock" | "database";

export function getDataDriver(): DataDriver {
  const value = process.env.BINIX_DATA_DRIVER?.trim().toLowerCase();

  if (!value || value === "mock") {
    return "mock";
  }

  if (value === "database") {
    return "database";
  }

  throw new Error(
    `Unsupported BINIX_DATA_DRIVER="${process.env.BINIX_DATA_DRIVER}"`,
  );
}
