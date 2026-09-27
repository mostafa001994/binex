import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl = "postgresql://invalid:invalid@localhost:5432/invalid";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
});
