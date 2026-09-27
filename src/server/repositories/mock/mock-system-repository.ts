import type { SystemRepository } from "@/server/repositories/contracts/system-repository";

export class MockSystemRepository implements SystemRepository {
  async getSnapshot() {
    return {
      dataDriver: "mock" as const,
      databaseConnected: false,
    };
  }
}
