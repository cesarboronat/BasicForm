// Cliente para webhooks de uContact (flujos de tipo Función → Webhook).
// El formulario productivo se sirve desde https://<instancia>.ucontactcloud.com/forms/<Nombre>/,
// por lo que window.location.origin apunta a la misma instancia.
// En modo "Servir" (/test/) verificar que el origen también sea la instancia.
const BASE = `${window.location.origin}/IntegraChannels/resources/webhook`;

export async function callWebhook(name, body, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Webhook ${name}: HTTP ${res.status}`);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  } finally {
    clearTimeout(timer);
  }
}
