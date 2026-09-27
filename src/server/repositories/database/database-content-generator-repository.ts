import { getPrismaClient } from "@/server/db/prisma";
import type { ContentGeneratorRepository } from "@/server/repositories/contracts/content-generator-repository";
import type { ContentGeneratorSettingsRecord } from "@/server/content-generator/content-generator-types";

const SERVICE_ID = "content-generator";
const INSTANCE_KEY = "default";

const credentialKinds = {
  keywordsEncrypted: "content_keywords",
  sourceUrlsEncrypted: "content_source_urls",
  targetSiteUrlEncrypted: "publisher_site_url",
  apiKeyEncrypted: "publisher_api_key",
  secretKeyEncrypted: "publisher_secret_key",
} as const;

type SettingKey = keyof typeof credentialKinds;

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

export class DatabaseContentGeneratorRepository
  implements ContentGeneratorRepository
{
  async getSettings(businessId: string) {
    const credentials = await getPrismaClient().serviceCredential.findMany({
      where: {
        businessId,
        serviceId: SERVICE_ID,
        instanceKey: INSTANCE_KEY,
        kind: { in: Object.values(credentialKinds) },
      },
    });

    const result = emptyRecord(businessId);

    for (const [key, kind] of Object.entries(credentialKinds) as Array<
      [SettingKey, string]
    >) {
      result[key] =
        credentials.find((credential) => credential.kind === kind)
          ?.encryptedValue ?? null;
    }

    if (credentials.length > 0) {
      result.updatedAt = credentials
        .reduce((latest, item) =>
          item.updatedAt > latest ? item.updatedAt : latest,
        credentials[0]!.updatedAt)
        .toISOString();
    }

    return result;
  }

  async updateSettings(
    businessId: string,
    input: Parameters<ContentGeneratorRepository["updateSettings"]>[1],
  ) {
    const prisma = getPrismaClient();

    for (const [key, kind] of Object.entries(credentialKinds) as Array<
      [SettingKey, string]
    >) {
      const value = input[key];

      if (value === undefined) continue;

      const identity = {
        businessId,
        serviceId: SERVICE_ID,
        instanceKey: INSTANCE_KEY,
        kind,
      };

      if (value === null) {
        await prisma.serviceCredential.deleteMany({ where: identity });
        continue;
      }

      await prisma.serviceCredential.upsert({
        where: {
          businessId_serviceId_instanceKey_kind: identity,
        },
        update: { encryptedValue: value },
        create: { ...identity, encryptedValue: value },
      });
    }

    return this.getSettings(businessId);
  }
}
