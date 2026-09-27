import type { SalesAgentCredentials } from "@/server/sales-agent/sales-agent-types";

export interface SalesAgentRepository {
  getCredentials(
    businessId: string,
  ): Promise<SalesAgentCredentials>;

  updateCredentials(
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
  ): Promise<SalesAgentCredentials>;
}
