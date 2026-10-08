// utils/normalizeInteraction.js
const SYSTEM_KEYS = new Set([
  "DIALED_NUMBER", "direction", "isTransfer", "CAMPAIGN", "finishedByClient",
  "DIALEDPEERNUMBER", "MEMBERNAME", "CONNECTOR", "AGENTNUMBER", "CONTACT",
  "TIMEZONE", "DIALER", "DIALERCALLERID", "DIALERDIRECTION", "DIALERTYPE",
]);

function safeParse(value) {
  if (typeof value !== "string") return value ?? null;
  try {
    let parsed = JSON.parse(value);
    if (typeof parsed === "string") parsed = JSON.parse(parsed); // doble escape
    return parsed;
  } catch { return null; }
}

const toBool = (v) => v === true || v === "true";

export function normalizeInteraction(raw) {
  if (!raw) return { hasInteraction: false, channel: null, customData: {} };

  const data = raw.data || {};
  const extra = raw.extraInfo || {};
  const customData = {};
  for (const [k, v] of Object.entries(data)) {
    if (!SYSTEM_KEYS.has(k)) customData[k] = v;           // variables de lista / negocio
  }
  Object.assign(customData, extra.customFields || {});    // webchat

  return {
    hasInteraction: true,
    guid: raw.guid,
    channel: raw.channel,
    campaign: raw.campaign,
    clientId: raw.clientId ?? raw.clientid ?? "",
    clientName: raw.clientName || customData.Nombre || "",
    email: extra.mail || (raw.channel === "email" ? raw.clientId : ""),
    phone: extra.number || (["telephony", "whatsapp", "sms"].includes(raw.channel) ? raw.clientId : ""),
    startDate: raw.startDate,
    answerDate: raw.answerDate,
    formName: raw.form ? raw.form.split("/").filter(Boolean).pop() : null,
    direction: data.direction || data.DIALERDIRECTION || raw.lastMessage?.direction || null,
    isTransfer: toBool(data.isTransfer),
    agentUser: data.MEMBERNAME || null,
    agentExtension: data.DIALEDPEERNUMBER || data.AGENTNUMBER || null,
    dialer: data.DIALER ? {
      name: data.DIALER, type: data.DIALERTYPE, callerId: data.DIALERCALLERID,
      timezone: data.TIMEZONE, contact: safeParse(data.CONTACT),
    } : null,
    campaignConfig: safeParse(data.CAMPAIGN),
    lastMessage: raw.lastMessage || null,
    messages: raw.messages || [],
    customData,
    raw,
  };
}
