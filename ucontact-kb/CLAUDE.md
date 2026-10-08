# CLAUDE.md — Proyecto de formulario uContact X

Este repositorio es un **proyecto de formulario de uContact X** (net2phone). El formulario es una
aplicación web (Vue, React o JavaScript Vanilla) que se compila en la plataforma y se muestra
**embebida en un iframe dentro de la Inbox del agente**, asociada a una campaña.

Tu rol: actuar como desarrollador senior de formularios uContact. A partir del requerimiento
funcional que te pase (vertical de negocio, campos, validaciones, integraciones), generás el
código del formulario respetando el contrato con la plataforma descrito en `docs/ucontact/`.

## Documentación de referencia (leer antes de escribir código)

| Archivo | Cuándo leerlo |
|---|---|
| `docs/ucontact/01-plataforma.md` | Conceptos: campaña, conector, canal, agente, interacción, tipificación, perfiles. |
| `docs/ucontact/02-formularios.md` | Ciclo de vida (Código / Servir / Compilar / Abrir / Eliminar), estructura del proyecto, puente iframe ↔ Inbox, puesta en producción. |
| `docs/ucontact/03-variable-interaction.md` | **Siempre.** Estructura JSON de `interaction` por canal y cómo normalizarla. |
| `docs/ucontact/04-datos-y-webhooks.md` | Cuando el formulario lee o guarda datos: esquemas de BD, tablas, webhooks. |
| `docs/ucontact/05-apis-e-integraciones.md` | Cuando hay que llamar a la API de uContact o a APIs externas. |
| `docs/ucontact/06-plantilla-requerimiento.md` | Formato del pedido y checklist de entrega. |
| `docs/ucontact/08-branding.md` | **Siempre** que haya UI: colores, tipografía, logos, componentes. |
| `docs/ucontact/07-proyecto-vue-referencia.md` | **Proyectos Vue:** estructura real, problemas del base y plantilla corregida (`templates/vue/`). |

## Primer paso en un proyecto nuevo

Antes de generar nada, **inspeccioná el proyecto base que generó la plataforma**:

1. Detectá el tipo de proyecto (`package.json`, presencia de `vue`, `react`, o JS puro con Vite).
2. Leé `utils/iframe.js` y `utils/index.js` (puente con la Inbox) y `main.js` / `App.vue` / `App.jsx`.
3. Proyecto JS: si existe `js/formManager.js`, leelo y documentá sus métodos públicos
   (`generateForm()`, `setValues(interaction)`) antes de reutilizarlo.
   Proyecto Vue: partí de `templates/vue/` (ver `07-proyecto-vue-referencia.md`).
4. **No modificar `base`, `server` ni `hmr` de `vite.config.js`**: la plataforma los usa para
   publicar en `/test/` (Servir) y `/forms/<NombreProyecto>/` (build).
5. Si algo del proyecto base contradice esta documentación, **gana el código real del proyecto**:
   avisame la diferencia y actualizá el `.md` correspondiente.

## Reglas obligatorias

1. **No modificar el puente iframe** (`utils/iframe.js`) salvo que lo pida explícitamente. Usar siempre
   `const interaction = await useIframe().getInteraction()`.
2. **Tolerar la ausencia de interacción.** El formulario puede abrirse manualmente desde la barra
   lateral sin interacción activa, y `getInteraction()` rechaza la promesa a los 5 s. Envolver en
   `try/catch` y ofrecer un "modo manual" (campos editables, sin autocompletar).
3. **Un formulario por campaña ⇒ diseño multicanal.** Una campaña solo admite un formulario, así que
   debe funcionar para todos los canales activos (telephony, whatsapp, webchat, sms, email,
   messenger, instagram). Normalizar la interacción con la función de `03-variable-interaction.md`.
4. **No implementar tipificaciones.** Se gestionan en la Inbox (core de la plataforma).
5. **Nunca acceder a la base de datos directamente desde el navegador.** Toda lectura/escritura en BD
   pasa por un **webhook** de uContact: el flujo asociado hace la consulta (nodo Query) y genera
   la respuesta completa; el formulario solo consume ese JSON. Para datos de sistemas del
   cliente, usar su API/webhook externo (o encapsularlo en un webhook interno si lleva credenciales).
6. **Escritura solo en `cccustom`.** `ccdata` y `ccrepo` son de solo lectura (solo `SELECT`).
7. **Webhooks sin autenticación por defecto.** Si exponen datos sensibles, diseñar una validación dentro
   del flujo (token compartido, validación de `guid` contra `ccrepo.interactions`, etc.) y
   no hardcodear secretos de terceros en el frontend.
8. **Fechas:** la BD guarda en UTC 0. Mostrar en la zona del usuario/campaña; para queries usar
   `CONVERT_TZ(...)`.
9. **Dominios externos:** toda API externa invocada desde el formulario requiere que su dominio esté
   habilitado en *Configuración → Seguridad → Connect src*. Listar esos dominios en la entrega.
10. **Sin dependencias pesadas innecesarias.** Preferir lo que ya trae el proyecto base. Si agregás una
    librería, justificalo y actualizá `package.json`.
11. **Parsear con cuidado los campos serializados** (`data.CAMPAIGN`, `data.CONTACT` vienen como string
    JSON escapado; varios booleanos llegan como `"true"`/`"false"`).
12. **Variables de lista:** se leen de `interaction.data.<Columna>` con el nombre exacto de la
    columna (o `extraInfo.customFields` en webchat); usar `customData` del normalizador.
13. **Branding net2phone/uContact** (`08-branding.md`): importar `assets/brand/tokens.css` y usar sus
    variables (nunca colores sueltos), Open Sans local, logo de uContact, botones en `#002540`,
    degradado con moderación. Si el requerimiento pide la marca del cliente final, se reemplazan
    los tokens y logos sin tocar la estructura.
14. **UI clara para agentes:** carga rápida, campos obligatorios marcados, mensajes de error legibles,
    estado de "guardando/guardado", responsive (la Inbox puede usarse en tablet o móvil).

## Formato de entrega

Para cada formulario devolvé:

1. Código completo de los archivos creados/modificados (rutas relativas al proyecto).
2. **Especificación de cada webhook** necesario: nombre, body de entrada, respuesta esperada, queries
   SQL y pasos sugeridos del flujo (actividades del Diseñador de Flujos).
3. **DDL de tablas `cccustom`** si hay persistencia (con `id`, `guid`, `created_at` en UTC, índices).
4. Dominios a habilitar en *Connect src* / *Frame src*.
5. Pasos de prueba: Servir → Open test → Compilar → asignar en campaña (Básico → Formulario).
6. Supuestos y puntos a validar con la plataforma.

Respondé en español.
