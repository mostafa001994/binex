export type SalesAgentCredentials = {
  businessId: string;
  baleBotTokenEncrypted: string | null;

  woocommerceStoreUrlEncrypted: string | null;
  woocommerceConsumerKeyEncrypted: string | null;
  woocommerceConsumerSecretEncrypted: string | null;

  updatedAt: string;
};

export type SalesAgentCredentialStatus = {
  baleBotTokenConfigured: boolean;
  baleBotTokenMasked: string | null;

  woocommerceConfigured: boolean;
  woocommerceStoreUrl: string | null;
  woocommerceConsumerKeyConfigured: boolean;
  woocommerceConsumerSecretConfigured: boolean;
  woocommerceConsumerKeyMasked: string | null;
  woocommerceConsumerSecretMasked: string | null;

  updatedAt: string;
};
