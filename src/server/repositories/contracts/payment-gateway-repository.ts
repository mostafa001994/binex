export type PaymentGatewayRecord = {
  id: string;
  name: string;
  slug: string;
  provider: string;
  enabled: boolean;
  priority: number;
  config: unknown;
  createdAt: Date;
  updatedAt: Date;
};


export type CreatePaymentGatewayInput = {
  name: string;
  slug: string;
  provider: string;
  enabled?: boolean;
  priority?: number;
  config?: unknown;
};


export type UpdatePaymentGatewayInput = {
  name?: string;
  enabled?: boolean;
  priority?: number;
  config?: unknown;
};


export interface PaymentGatewayRepository {

  list(): Promise<PaymentGatewayRecord[]>;

  findById(
    id:string
  ): Promise<PaymentGatewayRecord | null>;


  create(
    input:CreatePaymentGatewayInput
  ): Promise<PaymentGatewayRecord>;


  update(
    id:string,
    input:UpdatePaymentGatewayInput
  ): Promise<PaymentGatewayRecord | null>;


  delete(
    id:string
  ): Promise<void>;

}
