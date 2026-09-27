import type { SalesAgentCredentials } from "@/server/sales-agent/sales-agent-types";

type MockSalesAgentStore = {
  credentials: SalesAgentCredentials[];
};

declare global {
  var __binixMockSalesAgentStore: MockSalesAgentStore | undefined;
}

export function getMockSalesAgentStore(): MockSalesAgentStore {
  if (!globalThis.__binixMockSalesAgentStore) {
    globalThis.__binixMockSalesAgentStore = {
      credentials: [],
    };
  }

  return globalThis.__binixMockSalesAgentStore;
}
