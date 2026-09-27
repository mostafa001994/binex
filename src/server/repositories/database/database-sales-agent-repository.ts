import { getPrismaClient } from "@/server/db/prisma";
import type { SalesAgentRepository } from "@/server/repositories/contracts/sales-agent-repository";
import type { SalesAgentCredentials } from "@/server/sales-agent/sales-agent-types";

const SALES_AGENT_SERVICE_ID = "sales-agent";
const DEFAULT_INSTANCE_KEY = "default";

const BALE_TOKEN_KIND = "bale_bot_token";

const WOO_STORE_URL_KIND = "woocommerce_store_url";
const WOO_CONSUMER_KEY_KIND = "woocommerce_consumer_key";
const WOO_CONSUMER_SECRET_KIND = "woocommerce_consumer_secret";

type CredentialKind =
  | typeof BALE_TOKEN_KIND
  | typeof WOO_STORE_URL_KIND
  | typeof WOO_CONSUMER_KEY_KIND
  | typeof WOO_CONSUMER_SECRET_KIND;

export class DatabaseSalesAgentRepository
  implements SalesAgentRepository
{
  private async setCredential(
    businessId: string,
    kind: CredentialKind,
    encryptedValue: string | null,
  ): Promise<void> {
    const prisma = getPrismaClient();

    const key = {
      businessId,
      serviceId: SALES_AGENT_SERVICE_ID,
      instanceKey: DEFAULT_INSTANCE_KEY,
      kind,
    };

    if (encryptedValue === null) {
      await prisma.serviceCredential.deleteMany({
        where: key,
      });
      return;
    }

    await prisma.serviceCredential.upsert({
      where: {
        businessId_serviceId_instanceKey_kind: key,
      },
      update: {
        encryptedValue,
      },
      create: {
        ...key,
        encryptedValue,
      },
    });
  }

  async getCredentials(
    businessId: string,
  ): Promise<SalesAgentCredentials> {
    const credentials =
      await getPrismaClient().serviceCredential.findMany({
        where: {
          businessId,
          serviceId: SALES_AGENT_SERVICE_ID,
          instanceKey: DEFAULT_INSTANCE_KEY,
          kind: {
            in: [
              BALE_TOKEN_KIND,
              WOO_STORE_URL_KIND,
              WOO_CONSUMER_KEY_KIND,
              WOO_CONSUMER_SECRET_KIND,
            ],
          },
        },
      });

    const byKind = (kind: CredentialKind) =>
      credentials.find((item) => item.kind === kind);

    const latestUpdatedAt =
      credentials.length > 0
        ? credentials.reduce(
            (latest, item) =>
              item.updatedAt > latest
                ? item.updatedAt
                : latest,
            credentials[0]!.updatedAt,
          )
        : new Date();

    return {
      businessId,

      baleBotTokenEncrypted:
        byKind(BALE_TOKEN_KIND)?.encryptedValue ?? null,

      woocommerceStoreUrlEncrypted:
        byKind(WOO_STORE_URL_KIND)?.encryptedValue ?? null,

      woocommerceConsumerKeyEncrypted:
        byKind(WOO_CONSUMER_KEY_KIND)?.encryptedValue ?? null,

      woocommerceConsumerSecretEncrypted:
        byKind(WOO_CONSUMER_SECRET_KIND)?.encryptedValue ?? null,

      updatedAt: latestUpdatedAt.toISOString(),
    };
  }

  async updateCredentials(
    businessId: string,
    input: Partial<
      Pick<
        SalesAgentCredentials,
        | "baleBotTokenEncrypted"
        | "woocommerceStoreUrlEncrypted"
        | "woocommerceConsumerKeyEncrypted"
        | "woocommerceConsumerSecretEncrypted"
      >
    >,
  ): Promise<SalesAgentCredentials> {
    const updates: Array<
      [CredentialKind, string | null | undefined]
    > = [
      [BALE_TOKEN_KIND, input.baleBotTokenEncrypted],
      [WOO_STORE_URL_KIND, input.woocommerceStoreUrlEncrypted],
      [WOO_CONSUMER_KEY_KIND, input.woocommerceConsumerKeyEncrypted],
      [WOO_CONSUMER_SECRET_KIND, input.woocommerceConsumerSecretEncrypted],
    ];

    for (const [kind, value] of updates) {
      if (value !== undefined) {
        await this.setCredential(
          businessId,
          kind,
          value,
        );
      }
    }

    return this.getCredentials(businessId);
  }
}
