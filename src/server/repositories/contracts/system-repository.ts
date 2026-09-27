import type { DataDriver } from "@/server/config/data-driver";

export type SystemRepositorySnapshot = {
  dataDriver: DataDriver;
  databaseConnected: boolean;
};

export interface SystemRepository {
  getSnapshot(): Promise<SystemRepositorySnapshot>;
}
