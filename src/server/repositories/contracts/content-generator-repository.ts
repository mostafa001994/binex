import type { ContentGeneratorSettingsRecord } from "@/server/content-generator/content-generator-types";

export interface ContentGeneratorRepository {
  getSettings(businessId: string): Promise<ContentGeneratorSettingsRecord>;
  updateSettings(
    businessId: string,
    input: Partial<
      Pick<
        ContentGeneratorSettingsRecord,
        | "keywordsEncrypted"
        | "sourceUrlsEncrypted"
        | "targetSiteUrlEncrypted"
        | "apiKeyEncrypted"
        | "secretKeyEncrypted"
      >
    >,
  ): Promise<ContentGeneratorSettingsRecord>;
}
