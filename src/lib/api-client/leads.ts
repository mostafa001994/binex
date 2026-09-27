type Failure = { success: false; error: { message: string } };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } });
  const payload = await response.json() as { success: true; data: T } | Failure;
  if (!response.ok || !payload.success) throw new Error((payload as Failure).error?.message ?? "درخواست انجام نشد.");
  return payload.data;
}

export type ConsultationLead = {
  id: string;
  name: string | null;
  phone: string;
  businessName: string | null;
  businessType: string | null;
  need: string;
  channel: string | null;
  note: string | null;
  internalNote: string | null;
  source: string;
  status: "new" | "contacted" | "qualified" | "closed";
  consentAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ConsultationLeadMetrics = { total: number; new: number; contacted: number; qualified: number; closed: number };
export type ConsultationLeadPagination = { page: number; pageSize: number; total: number; totalPages: number };

export function getAdminConsultationLeadsApi(input: { search?: string; status?: string; source?: string; page?: number } = {}) {
  const query = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => { if (value !== undefined && value !== "") query.set(key, String(value)); });
  return api<{ items: ConsultationLead[]; sources: string[]; metrics: ConsultationLeadMetrics; pagination: ConsultationLeadPagination }>(`/api/v1/admin/leads?${query}`);
}

export function updateAdminConsultationLeadApi(id: string, input: { status: ConsultationLead["status"]; internalNote: string }) {
  return api<{ lead: ConsultationLead }>(`/api/v1/admin/leads/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
