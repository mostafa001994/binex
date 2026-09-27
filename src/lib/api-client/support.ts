type Failure = { success: false; error: { message: string } };
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } });
  const payload = await response.json() as { success: true; data: T } | Failure;
  if (!response.ok || !payload.success) throw new Error((payload as Failure).error?.message ?? "درخواست انجام نشد.");
  return payload.data;
}
export type SupportMessage = { id: string; body: string; isInternal: boolean; createdAt: string; author: { id: string; name: string | null; phone: string } };
export type SupportTicket = { id: string; ticketNumber: string; subject: string; category: string; status: string; priority: string; lastMessageAt: string; createdAt: string; firstResponseDueAt: string; resolutionDueAt: string; firstRespondedAt: string | null; sla: { firstResponseBreached: boolean; resolutionBreached: boolean }; messages?: SupportMessage[]; business?: { id: string; name: string; phone: string }; createdBy?: { id: string; name: string | null; phone: string }; assignedTo?: { id: string; name: string | null; phone: string } | null; _count?: { messages: number } };
export type AppNotification = { id: string; kind: string; title: string; message: string; href: string | null; readAt: string | null; createdAt: string };
export const getMyTicketsApi = () => api<{ items: SupportTicket[] }>("/api/v1/support/tickets");
export const getMyTicketApi = (id: string) => api<{ ticket: SupportTicket }>(`/api/v1/support/tickets/${id}`);
export const createTicketApi = (body: object) => api<{ ticket: SupportTicket }>("/api/v1/support/tickets", { method: "POST", body: JSON.stringify(body) });
export const replyTicketApi = (id: string, message: string) => api<{ ticket: SupportTicket }>(`/api/v1/support/tickets/${id}/messages`, { method: "POST", body: JSON.stringify({ message }) });
export const getNotificationsApi = () => api<{ items: AppNotification[]; unreadCount: number }>("/api/v1/notifications");
export const markNotificationApi = (id: string) => api<{ id: string; read: true }>(`/api/v1/notifications/${id}`, { method: "PATCH" });
export const markAllNotificationsApi = () => api<{ updated: number }>("/api/v1/notifications", { method: "PATCH" });
export type SupportMetrics = { open: number; unassigned: number; firstResponseOverdue: number; resolutionOverdue: number; averageFirstResponseMinutes: number | null; policy: { firstResponseMinutes: number; resolutionMinutes: number } };
export const getAdminSupportApi = (query = "") => api<{ items: SupportTicket[]; metrics: SupportMetrics }>(`/api/v1/admin/support${query}`);
export const getAdminTicketApi = (id: string) => api<{ ticket: SupportTicket }>(`/api/v1/admin/support/${id}`);
export const updateAdminTicketApi = (id: string, body: object) => api<{ ticket: SupportTicket }>(`/api/v1/admin/support/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const getSupportAssigneesApi = () => api<{ items: Array<{ id: string; name: string | null; phone: string }> }>("/api/v1/admin/support/assignees");
export type OperationalAlert = { key: string; title: string; count: number; kind: string; href: string };
export const getOperationalAlertsApi = () => api<{ items: OperationalAlert[] }>("/api/v1/admin/alerts");
