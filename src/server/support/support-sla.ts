const DEFAULT_FIRST_RESPONSE_MINUTES = 240;
const DEFAULT_RESOLUTION_MINUTES = 2880;

function configuredMinutes(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 && value <= 525_600 ? value : fallback;
}

export function supportSlaPolicy() {
  return {
    firstResponseMinutes: configuredMinutes("BINIX_SUPPORT_FIRST_RESPONSE_MINUTES", DEFAULT_FIRST_RESPONSE_MINUTES),
    resolutionMinutes: configuredMinutes("BINIX_SUPPORT_RESOLUTION_MINUTES", DEFAULT_RESOLUTION_MINUTES),
  };
}

export function supportSlaDeadlines(createdAt = new Date()) {
  const policy = supportSlaPolicy();
  return {
    firstResponseDueAt: new Date(createdAt.getTime() + policy.firstResponseMinutes * 60_000),
    resolutionDueAt: new Date(createdAt.getTime() + policy.resolutionMinutes * 60_000),
  };
}

export function getSlaState(ticket: {
  status: string;
  firstResponseDueAt: Date;
  resolutionDueAt: Date;
  firstRespondedAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
}) {
  const now = Date.now();
  const terminal = ticket.status === "RESOLVED" || ticket.status === "CLOSED";
  return {
    firstResponseBreached: !ticket.firstRespondedAt && ticket.firstResponseDueAt.getTime() < now,
    resolutionBreached: !terminal && ticket.resolutionDueAt.getTime() < now,
  };
}
