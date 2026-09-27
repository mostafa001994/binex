export const AutomationEvents = {
  USER_CREATED: "user.created",
  ORDER_PAID: "order.paid",
  SUBSCRIPTION_CREATED: "subscription.created",
  PROVISIONING_REQUESTED: "provisioning.requested",
  TICKET_CREATED: "ticket.created",
} as const;

export type AutomationEvent =
  (typeof AutomationEvents)[keyof typeof AutomationEvents];

export function createAutomationPayload(
  event: AutomationEvent,
  data: Record<string, unknown>
) {
  return {
    contractVersion: "1",
    event,
    timestamp: new Date().toISOString(),
    data,
  };
}
