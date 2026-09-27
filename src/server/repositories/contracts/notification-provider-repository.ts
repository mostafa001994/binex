export type NotificationProviderRecord = {
  id: string;
  name: string;
  channel: string;
  provider: string;
  enabled: boolean;
  isDefault: boolean;
  priority: number;
  config: unknown;
  createdAt: Date;
  updatedAt: Date;
};


export type CreateNotificationProviderInput = {
  name: string;
  channel: string;
  provider: string;
  enabled?: boolean;
  isDefault?: boolean;
  priority?: number;
  config?: unknown;
};


export type UpdateNotificationProviderInput = {
  name?: string;
  enabled?: boolean;
  isDefault?: boolean;
  priority?: number;
  config?: unknown;
};


export interface NotificationProviderRepository {

  list(): Promise<NotificationProviderRecord[]>;
findById(
 id:string,
):Promise<NotificationProviderRecord | null>;


  create(
    input: CreateNotificationProviderInput,
  ): Promise<NotificationProviderRecord>;


  update(
    id: string,
    input: UpdateNotificationProviderInput,
  ): Promise<NotificationProviderRecord>;


  delete(
    id: string,
  ): Promise<void>;

}
