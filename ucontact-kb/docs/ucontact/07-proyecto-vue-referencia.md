# 07 — Proyecto Vue de referencia (BasicForm)

Análisis del proyecto base que genera la plataforma para un formulario tipo **Vue**
(nombre del proyecto: `BasicForm`). Usar como patrón para todos los formularios Vue.

## Estructura real
```
index.html                 # <div id="app">, carga /src/main.js, <title>Form uContact</title>
package.json               # vue ^3.2.45 · vite ^4 · @vitejs/plugin-vue ^4 · gestor: yarn
vite.config.js             # ⚠ base y server los define la plataforma (ver abajo)
public/favicon.ico  public/vite.svg
src/main.js                # createApp(App).mount('#app')
src/style.css              # vacío
src/App.vue                # obtiene la interacción, header, maneja close/confirm
src/components/Form.vue    # campos del formulario
src/utils/iframe.js        # puente con la Inbox (idéntico a 02-formularios.md)
src/utils/index.js         # exporta useIframe() (singleton) e isEmpty(value)
src/assets/icons/uContact.png  src/assets/icons/vue.svg
```
A diferencia del proyecto JavaScript, **Vue no trae `formManager.js`**: los campos se definen
directamente en `Form.vue`.

## `vite.config.js` — no modificar `base` ni `server`
```js
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV !== "production" ? "/test/" : "/forms/BasicForm/",
  cacheDir: "/tmp/.vite",
  server: {
    host: true, port: 8081, base: "/test/",
    fs: { strict: false, allow: ["."] },
    hmr: { host: "<instancia>.ucontactcloud.com/test/ws" },
  },
});
```
- **Modo Servir** → se publica en `/test/` con HMR por websocket.
- **Build** → se publica en `/forms/<NombreProyecto>/`. Coincide con `interaction.form`
  (`https://<instancia>.ucontactcloud.com/forms/<NombreProyecto>/`).
- Cambiar `base`, puerto o `hmr` rompe *Open test* o el formulario productivo.
- Rutas a assets: importar desde `src/assets/...` (Vite las reescribe con el `base`) o usar `public/`.
  No usar rutas absolutas hardcodeadas tipo `/img/x.png`.

## `utils/index.js`
```js
import Iframe from "./iframe.js";
const iframe = new Iframe();          // singleton: un único listener de "message"
export function isEmpty(value) { /* null, undefined, "" o [] → true */ }
export function useIframe() { return iframe; }
```

## Patrón original
- `App.vue` llama `getInteraction()` en `onMounted`, guarda el resultado en `ref` y lo pasa a
  `<Form :interaction>`; `@close` → `useIframe().close()`, `@confirm` → `useIframe().sent()`.
- El título sale del penúltimo segmento de `interaction.form`.
- `Form.vue` define dos listas de campos:
  - `fields` → raíz de la interacción (`clientId`, `clientName`, `channel`, `campaign`).
  - `fieldsData` → **variables de la lista del marcador**, leídas de `interaction.data.<Columna>`
    (en el ejemplo: `Nombre`, `Apellido`, `Empresa`). El nombre debe coincidir **exactamente**
    (mayúsculas incluidas) con la columna marcada como "Parámetro" al cargar la lista.
- Estilo original (identidad anterior, reemplazada por `08-branding.md`): header `#0095ff` de 4rem con logos y título (Segoe UI 300, blanco), labels Verdana,
  inputs con borde redondeado, botón Confirm azul `#0095ff` / hover `#026db9`, error `#f44349`.

## Problemas detectados en el base (no replicar)
1. **Render roto antes de recibir la interacción.** `Form.vue` arranca con `interaction = {}` y el
   template usa `interaction.data[field.value]` → `TypeError` (data es `undefined`). Pasa en cada
   carga hasta que llega el `postMessage`, y **siempre** en apertura manual.
2. **Sin `try/catch` en `getInteraction()`**: en apertura manual la promesa rechaza a los 5 s y queda
   como error no manejado.
3. **Webchat no muestra los datos de negocio**: no tiene `data`; esos valores llegan en
   `extraInfo.customFields`.
4. `watch` sin `immediate` y `v-model` sobre el objeto del prop → muta el estado del padre.
5. `defineEmits(["confirm"])` no declara `close` (warning de Vue).
6. La validación usa `document.getElementById` en lugar del estado reactivo, y solo valida
   `fields` (no `fieldsData`).
7. Los campos de sistema (`channel`, `campaign`, `clientId`) quedan editables.
8. Confirmar no persiste nada (solo `sent()`), y no hay estados de carga, guardado o error.

## Plantilla corregida
En `templates/vue/src/` de esta base de conocimiento:

| Archivo | Cambio |
|---|---|
| `App.vue` | `try/catch` + modo manual, `normalizeInteraction()`, estados `loading`/`saving`/`error`, layout flex. Punto de enganche para el webhook comentado. |
| `components/Form.vue` | Una sola lista `fields` con `source: "interaction" \| "data"`, modelo reactivo local, `watch` con `immediate`, validación reactiva con mensajes y ARIA, campos de sistema bloqueados si hay interacción, botón deshabilitado mientras guarda. |
| `utils/normalizeInteraction.js` | Normalizador multicanal (`customData` une `data` de la lista y `customFields` del webchat). |
| `assets/brand/` | Copia de `templates/brand/` (tokens.css + logos). Requiere `yarn add @fontsource/open-sans`. |
| `utils/webhook.js` | `callWebhook(name, body)` usando `window.location.origin` (el formulario se sirve desde la misma instancia). |

`main.js`, `style.css`, `utils/iframe.js`, `utils/index.js`, `index.html`, `package.json` y
`vite.config.js` **se mantienen los del proyecto generado**.

### Cómo agregar un campo de la lista del marcador
1. Cargar la lista con la columna marcada como *Parámetro* (ej. `Deuda`).
2. En `Form.vue` → `fields`, agregar `{ key: "Deuda", label: "Deuda", source: "data" }`.
3. Probar con *Servir → Open test* y luego con una llamada real del Hub (en *Open test* no hay
   interacción, así que el formulario abre en modo manual).
