# 04 — Base de datos y webhooks

## Regla de oro
El formulario **no se conecta a la BD**. Para leer o guardar datos:
**Formulario → `fetch` → Webhook uContact (flujo) → actividad Query → BD**.

Patrón confirmado en la operación:
1. Se crea el webhook (*Automatizaciones → Funciones → NUEVO → Webhook*) y se le asocia un flujo.
2. El flujo recibe el body, ejecuta la consulta con el nodo de base de datos (**Query**) y
   **arma la respuesta completa dentro del mismo flujo** (parseo/formato con *Procedure*).
3. El formulario solo consume el JSON de respuesta: nunca ve SQL ni credenciales.

Objetivo: no impactar directamente la base de datos desde el frontend, centralizar la lógica
de acceso y poder controlar/validar lo que se ejecuta.

Dos variantes:
- **Webhook interno (uContact)**: flujo con nodo Query sobre `ccdata` / `ccrepo` (solo SELECT) o
  `cccustom` (lectura y escritura). Es la opción por defecto.
- **Webhook / API externa**: cuando los datos viven en un sistema del cliente (CRM, ERP, backend
  propio). Desde el formulario se llama directo (dominio en *Connect src*) o, si requiere
  credenciales, a través de un webhook interno que use la actividad *WebService*.

## Esquemas (MySQL 8 en Cloud SQL)

| Esquema | Contenido | Permisos |
|---|---|---|
| `ccdata` | Configuración: usuarios, campañas, miembros, tipificaciones, blacklist, feriados, conectores. | Solo lectura (`SELECT`) |
| `ccrepo` | Histórico transaccional: interacciones, mensajes por canal, estadísticas. | Solo lectura (`SELECT`) |
| `cccustom` | Tablas propias de los desarrollos (formularios, flujos). | Lectura y escritura (DDL/DML) |

**Zona horaria:** todos los timestamps se guardan en **UTC 0**. El portal convierte según el navegador.
```sql
SELECT *, CONVERT_TZ(time, 'UTC', 'America/Montevideo') AS hora_local
FROM ccrepo.webchat_messages
WHERE CONVERT_TZ(time, 'UTC', 'America/Montevideo') BETWEEN '2024-01-22 12:00:00' AND '2024-01-22 14:00:00';
```

## Tablas útiles

### `ccdata`
- **users**: `username`, `password` (encriptada), `phone` (extensión PBX), `name`, `email`, `profile`,
  `transport`, `security` (json), `language`, `licenciator`, `superuser`, `favorites`, `avatar`,
  `timezone`, `schedule` (json), `encrypted`, `preferences` (json).
- **campaigns**: `name` + `object` (JSON con config: `crm`, `form`, `enabled`, `channels`, `schedule`,
  `timezone`, `penalties`, `manualForm`, `qualityModels`, `transferCampaigns`, ...). Un registro por campaña.
- **members**: `campaign`, `agent`, `channel`, `penalty`, `inbound`, `outbound`, `hub`, `position`.
- **dispositions**: `id`, `parentId` (0 = nivel 1), `value`, `action`, `campaign` (null = genérica),
  `channels`, `voicemail`, `validAsFinal`, `enabled`, `parentIds` (camino separado por coma),
  `requiredComment`, `textcode`.
- **blacklist**: `clientId`, `campaign`, `date`.
- **holidays**: `name`, `campaigns` (vacío = todas), `date`, `start`, `end`, `audio`, `email`,
  `message`, `recurring`, `subject`.
- Otras visibles: `agendas`, `calls_scheduled`, `connectors`, `dialer_lists`, `dialers`, `flows`, `forms`, `configuration`.

### `ccrepo`
- **interactions** (una fila por tramo): `id`, `guid`, `start_date`, `end_date`, `campaign`, `channel`,
  `agent`, `data` (json: variables de flujos/bots/lista), `contact` (json), `dialerId`, `contactId`,
  `dialerList`, `disposition_id`, `dispositionIds`, `clientId`, `connectorId`, `finished`.
  `data->'$.levels'` contiene los nombres de los niveles de tipificación.
- **{canal}_messages**: `webchat_messages`, `whatsapp_messages`, `sms_messages`, `email_messages`,
  `messenger_messages`, `instagram_messages`, `agent_messages`, `campaign_messages`.
  Columnas comunes: `time`, `direction`, `guid`, `campaign`, `agent`, `message`/`text`, `attachments`.
- **campaign_stats / agent_stats / dialer_stats**: una fila cada 15 min con un JSON `obj` de métricas.

```sql
-- Tramos de una interacción
SELECT id, campaign, agent, disposition_id, dispositionIds, data->'$.levels' AS niveles
FROM ccrepo.interactions WHERE guid = '<guid>';
```

## Diseño de tablas en `cccustom` (convención sugerida)
```sql
CREATE TABLE cccustom.<vertical>_<entidad> (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  guid         VARCHAR(80)  NOT NULL,          -- interacción de origen (vacío si fue manual)
  campaign     VARCHAR(200) NULL,
  channel      VARCHAR(24)  NULL,
  agent        VARCHAR(80)  NULL,
  client_id    VARCHAR(200) NULL,
  -- campos del negocio...
  payload      JSON         NULL,              -- datos extra flexibles
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- UTC
  updated_at   DATETIME     NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_guid (guid),
  INDEX idx_client (client_id)
);
```
Crear las tablas desde *Desarrollador → Database* (herramientas Query o Table).

## Webhooks (flujos de tipo Función)

- Creación: *Administrador → Automatizaciones → Funciones → NUEVO → Webhook*. Botón **PRODUCCIÓN**
  para activarlo (GUARDAR solo lo deja en desarrollo).
- Endpoint:
  ```
  https://<instancia>.ucontactcloud.com/IntegraChannels/resources/webhook/<nombreWebhook>
  ```
- Los parámetros se envían en el **body**.
- **No requiere token**. Si hace falta seguridad, implementarla dentro del flujo.
- Actividades y sintaxis: las mismas que los flujos **BOT** (JavaScript en *Procedure*; referencias
  `${variable}`; condiciones `$["${V1}"="valor"]`).
- Depuración: Consola del diseñador (paso a paso), LogOp (`${log}` en log SEVERE), Postman.

### Actividades relevantes para webhooks
| Actividad | Uso |
|---|---|
| **Query** | Campos: base de datos (esquema), variable de resultado, query. `ccdata`/`ccrepo` solo SELECT. |
| **Procedure** | JS para parsear entrada/salida, validar, armar SQL o respuesta. |
| **Evaluate** | Bifurcación (flecha azul = verdadero, roja = falso). |
| **WebService** | Llamar APIs externas desde el backend (método, URL, body, headers, content-type). |
| **Function (Go-To-Function)** | Reutilizar lógica en funciones. |
| **Webhook Response** (nodo final visible en el diseñador) | Devuelve la respuesta al invocador. *Nombre exacto y configuración por verificar en el diseñador.* |

> **Por verificar en la plataforma:** cómo se referencian los campos del body dentro del flujo
> (p. ej. `${campo}`), el formato del resultado de Query cuando devuelve múltiples filas, y cómo
> configurar el status/cuerpo del nodo de respuesta. Al trabajar en un proyecto, pedir una
> exportación (`.txt`) de un webhook existente y documentar la estructura aquí.

### Contrato recomendado entre formulario y webhook
Request:
```json
{ "action": "save", "guid": "<guid>", "token": "<opcional>", "payload": { "...": "..." } }
```
Response:
```json
{ "ok": true, "data": { }, "error": null }
```
Un webhook por responsabilidad (`<vertical>_get_cliente`, `<vertical>_save_gestion`) o un único
webhook con `action`. Validar en el flujo todos los campos antes de construir SQL y **escapar valores**
(nunca concatenar texto libre del agente sin sanitizar).

### Cliente JS desde el formulario
```js
const BASE = "https://<instancia>.ucontactcloud.com/IntegraChannels/resources/webhook";

export async function callWebhook(name, body, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
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
    clearTimeout(t);
  }
}
```
Definir la instancia en una sola constante/config (o derivarla de `interaction.form` con `new URL(...).origin`).

## Otras funciones de automatización
- **Eventos**: envían JSON a un endpoint externo ante `AgentRingNoAnswer`, `AgentLog`, `AgentBreak`,
  `FinishInteraction`, `Disposition` (`SentDisposition`), `AssignInteraction`. Tienen flujo asociado.
- **Scheduler**: SQL Script, Shell Script o Export (a SFTP o email) con frecuencia programada.
- **BOT**: al iniciar / al finalizar / después de timeout en canales de texto. Variables que empiezan
  con `__` son globales entre flujos.
