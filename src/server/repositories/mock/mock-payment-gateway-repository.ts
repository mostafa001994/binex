import type {
  PaymentGatewayRepository,
  PaymentGatewayRecord,
  CreatePaymentGatewayInput,
  UpdatePaymentGatewayInput,
} from "@/server/repositories/contracts/payment-gateway-repository";


export class MockPaymentGatewayRepository
  implements PaymentGatewayRepository
{

  private items: PaymentGatewayRecord[] = [];


  async list(): Promise<PaymentGatewayRecord[]> {
    return this.items;
  }


  async findById(
    id: string,
  ): Promise<PaymentGatewayRecord | null> {

    return (
      this.items.find(
        (item) => item.id === id,
      ) ?? null
    );

  }


  async create(
    input: CreatePaymentGatewayInput,
  ): Promise<PaymentGatewayRecord> {

    const now = new Date();


    const item: PaymentGatewayRecord = {

      id: crypto.randomUUID(),

      name: input.name,

      slug: input.slug,

      provider: input.provider,

      enabled: input.enabled ?? true,

      priority: input.priority ?? 0,

      config: input.config ?? {},

      createdAt: now,

      updatedAt: now,

    };


    this.items.push(item);


    return item;

  }



  async update(
    id: string,
    input: UpdatePaymentGatewayInput,
  ): Promise<PaymentGatewayRecord | null> {


    const current =
      await this.findById(id);


    if (!current) {
      return null;
    }


    const updated: PaymentGatewayRecord = {

      ...current,

      name:
        input.name ?? current.name,

      enabled:
        input.enabled ?? current.enabled,

      priority:
        input.priority ?? current.priority,

      config:
        input.config ?? current.config,

      updatedAt:
        new Date(),

    };


    this.items =
      this.items.map(
        (item) =>
          item.id === id
            ? updated
            : item,
      );


    return updated;

  }



  async delete(
    id: string,
  ): Promise<void> {

    this.items =
      this.items.filter(
        (item) => item.id !== id,
      );

  }

}
