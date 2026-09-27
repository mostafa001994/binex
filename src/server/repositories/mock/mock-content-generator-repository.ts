import type { ContentGeneratorRepository } from "@/server/repositories/contracts/content-generator-repository";
import type { ContentGeneratorSettingsRecord } from "@/server/content-generator/content-generator-types";

const records = new Map<string, ContentGeneratorSettingsRecord>();

function emptyRecord(businessId: string): ContentGeneratorSettingsRecord {
  return {
    businessId,
    keywordsEncrypted: null,
    sourceUrlsEncrypted: null,
    targetSiteUrlEncrypted: null,
    apiKeyEncrypted: null,
    secretKeyEncrypted: null,
    updatedAt: new Date(0).toISOString(),
  };
}

export class MockContentGeneratorRepository
  implements ContentGeneratorRepository
{
  async getSettings(businessId: string) {
    return records.get(businessId) ?? emptyRecord(businessId);
  }

  async updateSettings(
    businessId: string,
    input: Parameters<ContentGeneratorRepository["updateSettings"]>[1],
  ) {
    const updated = {
      ...(await this.getSettings(businessId)),
      ...input,
      updatedAt: new Date().toISOString(),
    };
    records.set(businessId, updated);
    return updated;
  }
}
