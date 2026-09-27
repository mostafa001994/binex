export type ContentGeneratorSettingsRecord = {
  businessId: string;
  keywordsEncrypted: string | null;
  sourceUrlsEncrypted: string | null;
  targetSiteUrlEncrypted: string | null;
  apiKeyEncrypted: string | null;
  secretKeyEncrypted: string | null;
  updatedAt: string;
};

export type ContentGeneratorSettings = {
  keywords: string[];
  sourceUrls: string[];
  targetSiteUrl: string | null;
  apiKeyConfigured: boolean;
  secretKeyConfigured: boolean;
  connectionConfigured: boolean;
  updatedAt: string;
};
