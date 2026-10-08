# 03 — La variable global `interaction`

Se obtiene con:
```js
const interaction = await useIframe().getInteraction();
```
Es un JSON con la interacción que el agente está procesando. La forma **cambia según el canal**.

## Campos comunes (todos los canales)

| Campo | Descripción |
|---|---|
| `guid` | ID único de la interacción (compartido por todos los tramos). |
| `channel` | `telephony`, `whatsapp`, `webchat`, `sms`, `email`, `messenger`, `instagram`. |
| `campaign` | Campaña que procesa la interacción. |
| `clientId` | Teléfono (voz/SMS/WhatsApp), email, o ID alfanumérico (webchat). En la documentación aparece también como `clientid`; en el JSON real es `clientId`. |
| `clientName` | Vacío en telefonía; en webchat lo que puso el cliente; en redes, el nombre del perfil. |
| `startDate` | Inicio (`YYYY-MM-DD HH:mm:ss`). |
| `answerDate` | Momento de atención. |
| `form` | URL del formulario asociado a la campaña. |

## Telefonía — llamada manual (entrante / saliente)
```json
{
  "guid": "05f2e55d-becf-4005-b953-13c6d39008c7",
  "channel": "telephony",
  "campaign": "Campaign_1",
  "clientId": "59297234567",
  "clientName": "",
  "startDate": "2025-07-10 15:33:26",
  "answerDate": "2025-07-10 15:33:38",
  "form": "https://<instancia>.ucontactcloud.com/forms/ventas/",
  "data": {
    "DIALED_NUMBER": "12313123",
    "direction": "inbound",
    "isTransfer": "false",
    "CAMPAIGN": "{\"name\":\"Campaign_1\",\"virtualHold\":\"false\",\"queueSurvey\":\"false\",\"queueTimeout\":\"600\",\"record\":\"true\",\"language\":\"es\",\"autoAnswer\":false,\"isOnTime\":\"true\",\"isBlacklisted\":\"false\",\"holiday\":\"\",\"finishIvr\":\"\",\"outboundConnector\":\"prueba\",\"musicOnHold\":\"music-Campaign_1\",\"ivr\":\"\",\"context\":\"campaigns\"}",
    "finishedByClient": "true",
    "DIALEDPEERNUMBER": "3264",
    "MEMBERNAME": "ger"
  },
  "holdTime": 0
}
```
`data`: `DIALED_NUMBER` (DID/CallerID), `direction` (`inbound`/`outbound`), `isTransfer`,
`CAMPAIGN` (config de campaña **serializada**), `finishedByClient`, `DIALEDPEERNUMBER`
(extensión del agente), `MEMBERNAME` (usuario del agente). `holdTime` en segundos.

## Telefonía — llamada por Hub saliente (marcador)
```json
{
  "guid": "b7672703-e2bb-4a27-9935-4286f6615597",
  "channel": "telephony",
  "campaign": "Ventas",
  "clientId": "01159896230790",
  "clientName": "",
  "startDate": "2025-07-21 13:59:15",
  "answerDate": "2025-07-21 13:59:15",
  "form": "https://<instancia>.ucontactcloud.com/forms/ventas/",
  "data": {
    "Deuda": 123234234,
    "Nombre": "Sebastian Pena",
    "CONNECTOR": "3670994938",
    "AGENTNUMBER": "5252",
    "CONTACT": "{\"dialer\":\"VistaPrevia\",\"dialerList\":\"43e4eeee-be48-43c2-b2ac-689fb926633b\",\"id\":59,\"content\":\"\",\"timezone\":\"\",\"contactId\":\"\",\"priority\":1,\"agent\":null,\"causeCode\":null,\"tries\":0,\"clientIndex\":0,\"template\":null,\"attachments\":[],\"clientIds\":[\"01159896230790\"]}",
    "TIMEZONE": "America/Montevideo",
    "DIALER": "VistaPrevia",
    "DIALERCALLERID": "12012344983",
    "DIALERDIRECTION": "out",
    "DIALERTYPE": "Preview",
    "CAMPAIGN": "{...config serializada...}"
  }
}
```
- Las **variables de la lista** (parámetros cargados en el marcador, ej. `Deuda`, `Nombre`) llegan
  sueltas dentro de `data`, mezcladas con las variables del sistema (en MAYÚSCULAS).
- `CONTACT` (registro del marcador) y `CAMPAIGN` vienen serializados.

## Webchat
```json
{
  "guid": "c44a60c8-29bd-468b-9be4-d23c4fcfe0e9",
  "channel": "webchat",
  "campaign": "ATC",
  "clientId": "cf994460-350a-fb1e-e27b-b04212dd8b9c",
  "clientName": "Pepe",
  "startDate": "2025-07-21 14:03:14",
  "answerDate": "2025-07-21 14:03:24",
  "form": "https://<instancia>.ucontactcloud.com/forms/ventas/",
  "lastMessage": {
    "text": "Hola", "attachments": [], "isAudio": false,
    "source": "agente1", "direction": "in", "fromBot": false
  },
  "extraInfo": {
    "mail": "seba@seba.com",
    "initialMessage": "Hola",
    "number": "345345345",
    "ipAddress": "https://<instancia>.ucontactcloud.com/webchatclient/#/form?campaign=ATC",
    "customFields": { "Nombre": "Seba", "Deuda": "7567567567" }
  }
}
```
- Sin `data`. Los campos extra del formulario inicial del webchat están en `extraInfo.customFields`.
- `extraInfo.ipAddress` es en realidad la URL del webchat.

## Resto de canales de texto (WhatsApp, SMS, Messenger, Instagram, Email)
```json
{
  "guid": "d1fcf67e-a896-476c-a963-4408b502e370",
  "channel": "whatsapp",
  "campaign": "Campaign_1",
  "clientId": "59897494469",
  "clientName": "Ggerman",
  "startDate": "2025-07-21 14:16:37",
  "answerDate": "2025-07-21 14:17:17",
  "form": "https://<instancia>.ucontactcloud.com/forms/ventas/",
  "data": {},
  "lastMessage": {
    "id": 488, "text": "Ksksjs", "attachments": [], "isAudio": false,
    "source": "PideNombre", "direction": "in",
    "date": "2025-07-21 14:17:10", "status": "RECEIVED", "fromBot": true
  },
  "messages": [
    { "id": 487, "channelId": "wamid....", "text": "Hola", "attachments": [] },
    { "id": 488, "channelId": "wamid....", "text": "Ksksjs", "attachments": [] }
  ]
}
```
- `data`: variables adicionales (provienen de la lista del marcador si la interacción salió de un Hub).
- `lastMessage.source`: en el ejemplo contiene el nombre de un BOT/actividad (`PideNombre`) o de un
  agente (`agente1`). **Semántica no documentada oficialmente — verificar.**
- `messages`: historial hasta el momento de la recepción.
- Email: los campos específicos (asunto, cuerpo) no están documentados en la variable; verificar
  con una interacción real.

## Normalizador recomendado
Usar siempre una capa de normalización para que la UI no dependa del canal:

```js
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
```
