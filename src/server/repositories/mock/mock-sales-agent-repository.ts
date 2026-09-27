import type { SalesAgentRepository } from "@/server/repositories/contracts/sales-agent-repository";
import { getMockSalesAgentStore } from "@/server/repositories/mock/mock-sales-agent-store";
import type { SalesAgentCredentials } from "@/server/sales-agent/sales-agent-types";

function createDefault(
  businessId: string,
): SalesAgentCredentials {
  return {
    businessId,
    baleBotTokenEncrypted: null,
    woocommerceStoreUrlEncrypted: null,
    woocommerceConsumerKeyEncrypted: null,
    woocommerceConsumerSecretEncrypted: null,
    updatedAt: new Date().toISOString(),
  };
}

export class MockSalesAgentRepository
  implements SalesAgentRepository
{
  async getCredentials(
    businessId: string,
  ): Promise<SalesAgentCredentials> {
    const store = getMockSalesAgentStore();

    let credentials = store.credentials.find(
      (item) => item.businessId === businessId,
    );

    if (!credentials) {
      credentials = createDefault(businessId);
      store.credentials.push(credentials);
    }

    return credentials;
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
    const credentials = await this.getCredentials(businessId);

    Object.assign(credentials, input, {
      updatedAt: new Date().toISOString(),
    });

    return credentials;
  }
}
