import crypto from "node:crypto";

const endpoint = process.env.N8N_BASE_URL;
const secret = process.env.N8N_WEBHOOK_SECRET;

function sign(payload: unknown) {
  return crypto
    .createHmac("sha256", secret ?? "")
    .update(JSON.stringify(payload))
    .digest("hex");
}

export async function sendToN8n(payload: unknown) {
  if (!endpoint) throw new Error("N8N_BASE_URL is missing");

  const response = await fetch(`${endpoint}/webhook/binix-event`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-binix-signature": sign(payload),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`n8n returned ${response.status}`);
  }

  return response.json();
}
