import type {
  Business,
  BusinessMember,
  BusinessService,
} from "@/server/business/business-types";

type MockBusinessStore = {
  businesses: Business[];
  members: BusinessMember[];
  services: BusinessService[];
};

declare global {
  var __binixMockBusinessStore: MockBusinessStore | undefined;
}

export function getMockBusinessStore(): MockBusinessStore {
  if (!globalThis.__binixMockBusinessStore) {
    globalThis.__binixMockBusinessStore = {
      businesses: [],
      members: [],
      services: [],
    };
  }

  return globalThis.__binixMockBusinessStore;
}
