import { getPrismaClient } from "@/server/db/prisma";
import type {
  SystemRepository,
  SystemRepositorySnapshot,
} from "@/server/repositories/contracts/system-repository";

export class DatabaseSystemRepository
  implements SystemRepository
{
  async getSnapshot(): Promise<SystemRepositorySnapshot> {
    await getPrismaClient().$queryRaw`SELECT 1`;

    return {
      dataDriver: "database",
      databaseConnected: true,
    };
  }
}