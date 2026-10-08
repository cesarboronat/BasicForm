# 01 — Conceptos de la plataforma uContact X

## Qué es
- Plataforma de contact center **100 % web**, en la nube de net2phone sobre **Google Cloud**.
- No es multi-tenant: la segmentación se hace con **perfiles** de visibilidad restringida.
- Stack: Cloud SQL (MySQL 8), Cloud Storage, VMs · Ubuntu Server 24 LTS · Nginx · Asterisk 22 (PBX) ·
  Java 21 y Node 22 (lógica de aplicación).
- Licenciamiento por **usuario concurrente**.
- Retención de datos: 1 año hacia atrás desde hoy (extensible con costo).

## Los tres conceptos clave

### Conector (canal)
- El **canal** es el medio (telefonía, WhatsApp, SMS, email, Messenger, Instagram, webchat).
- El **conector** es el proveedor que lo implementa. El canal no se configura por separado: viene
  dado por el conector.
- Webchat no requiere conector (está embebido en la plataforma).
- Valores de `channel` que aparecen en datos: `telephony`, `whatsapp`, `webchat`, `sms`, `email`,
  `messenger`, `instagram`.

### Campaña
- Concentrador de las conversaciones (pensarla como línea de negocio: ventas, cobranza, soporte).
- Define conectores por canal, agentes miembros, estrategia de distribución, horarios, tipificaciones,
  plantillas, contactos, campañas de transferencia y **un único formulario**.
- Necesita al menos 1 agente disponible para distribuir (salvo que un BOT tome la interacción).
- Puede tener BOT al iniciar, al finalizar y después de timeout por canal de texto.

### Agente (usuario)
- Procesa interacciones desde la **Inbox**. Puede pertenecer a varias campañas.
- Desde la Inbox abre el formulario de la campaña: automáticamente en la interacción o manualmente
  desde el ícono de formulario de la barra lateral.

## Interacción
- Registro de una conversación con un cliente por un canal. Identificada por `guid`.
- Puede tener varios **tramos** (uno por campaña recorrida: inicio-transfer, transfer-transfer,
  inicio-fin, transfer-fin). Todos los tramos comparten `guid`; en `ccrepo.interactions` hay una fila
  por tramo.
- Datos relevantes: fecha/hora, canal, agente, campaña, contenido, duración, tipificación, datos extra.

## Tipificación (disposition)
- "Fin de gestión", árbol de N niveles + comentario opcional/obligatorio.
- Genérica (todas las campañas, `campaign` vacío) o específica de una campaña.
- Se tipifica al transferir entre campañas o al finalizar. **No** se implementa en formularios:
  la Inbox la maneja.

## Perfiles
- Agente: solo Inbox, sin configuración ni estadísticas.
- Super usuario: acceso total.
- Para ver *Desarrollador → Formularios / Database* y *Administrador → Automatizaciones* hacen falta
  permisos específicos en el perfil (y un usuario de BD solicitado a infraestructura para Database).

## Marcadores (Outbound Hub)
- Listas cargadas por portal (XLSX, ODS, CSV, TXT) o por API.
- Las columnas marcadas como **Parámetros** viajan en `interaction.data` y se pueden mostrar en el
  formulario (ej. `Deuda`, `Nombre`, `cedula`).
- Tipos de marcador vistos: Preview, Predictive, etc. (`data.DIALERTYPE`).
