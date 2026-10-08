# 02 — Desarrollo de formularios

## Qué es un formulario uContact
Un proyecto web (Vue, React o JavaScript Vanilla, con Vite) creado desde
*Desarrollador → Formularios → NUEVO* (nombre + tipo de proyecto). Se edita con un IDE tipo
VS Code embebido y se muestra en un iframe dentro de la Inbox.

## Ciclo de vida (menú ⋮ del proyecto)

| Acción | Efecto |
|---|---|
| **Código** | Abre el IDE (pestaña externa) con la estructura del proyecto. |
| **Servir** | Levanta el proyecto en modo desarrollo (cambios en tiempo real). Habilita **Open test** y **Stop serve**. |
| **Compilar** (build) | Genera la versión productiva. Columna "Último build" indica la fecha. |
| **Abrir formulario** | Vista previa de la versión compilada sin usar una campaña real. |
| **Eliminar** | Borra el proyecto **sin posibilidad de recuperar** (no hay historial de versiones). Requiere *Stop serve* si está servido. La campaña asociada queda sin formulario. |

Estado de la lista: el formulario debe estar **"Disponible"** para usarse en una campaña.

> Como no hay versionado en la plataforma, mantener el código también en un repositorio Git propio.

## Estructura típica (proyecto JS Vanilla generado)
```
.vscode/launch.json
assets/  dist/  public/  node_modules/
js/formManager.js        # helper generado (generateForm, setValues) — verificar en el proyecto
utils/iframe.js          # puente con la Inbox (NO modificar)
utils/index.js           # exporta useIframe()
index.html               # contiene el elemento #title y el contenedor del form
main.js
style.css
package.json  vite.config.js  yarn.lock
```
Vue y React varían en estructura pero comparten `utils/iframe.js` y `useIframe()`.
Estructura Vue real y su `vite.config.js`: ver `07-proyecto-vue-referencia.md` (Vue no trae `formManager.js`).

## Puente iframe ↔ Inbox (`utils/iframe.js`)
Código base de la plataforma:

```js
export default class Iframe {
  constructor() {
    this.resolve = null;
    window.addEventListener("message", (e) => {
      const data = e.data;
      if (data.action) {
        switch (data.action) {
          case "interaction":
            this.resolve(data.interaction);
            break;
        }
      }
    });
  }
  async getInteraction() {
    window.parent.postMessage({ action: "getInteraction" }, "*");
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      setTimeout(() => {
        reject({ error: "Timeout getting interaction" });
      }, 5000);
    });
  }
  close() { window.parent.postMessage({ action: "close" }, "*"); }
  sent()  { window.parent.postMessage({ action: "sent" }, "*"); }
}
```

Mensajes soportados:
- `getInteraction` → la Inbox responde con `{ action: "interaction", interaction }`.
- `close` → pide a la Inbox cerrar el formulario.
- `sent` → notifica a la Inbox que el formulario fue enviado/confirmado. Los proyectos base lo
  llaman en el botón Confirmar (*efecto exacto en la Inbox por verificar*).

`utils/index.js` expone `useIframe()` (instancia única de `Iframe`) e `isEmpty(value)`.

## `main.js` base (JS Vanilla)
```js
import FormManager from "./js/formManager";
import { useIframe } from "./utils";
import "./style.css";

class Main {
  static async init() {
    let form = new FormManager({});
    form.generateForm();
    let interaction = await useIframe().getInteraction();
    document.getElementById("title").innerHTML =
      interaction && interaction.form
        ? interaction.form.split("/")[interaction.form.split("/").length - 2]
        : "uContact Form";
    form.setValues(interaction);
  }
}
Main.init();
```
El formulario base muestra Client Id, Client name, Channel y Campaign con botones Cancel / Confirm.

## Patrón recomendado de arranque (robusto)
```js
import { useIframe } from "./utils";

async function loadInteraction() {
  try {
    return await useIframe().getInteraction();   // con interacción activa
  } catch (err) {
    console.warn("Sin interacción (apertura manual o timeout):", err);
    return null;                                  // modo manual
  }
}
```
- Botón **Cancelar** → `useIframe().close()`.
- Botón **Confirmar/Guardar** → validar → llamar webhook → si OK `useIframe().sent()` (y opcionalmente `close()`).
- El nombre del formulario puede obtenerse de `interaction.form` (penúltimo segmento de la URL,
  ej. `https://<instancia>.ucontactcloud.com/forms/ventas/` → `ventas`).

## Puesta en producción
1. Compilar el proyecto.
2. *Campañas → Editar campaña → BÁSICO → Formulario*: seleccionar el formulario y guardar.
3. Opcional: "Apertura manual de formulario" para que los agentes lo abran desde la barra lateral.
4. Desde ese momento se ve en cada interacción de la campaña y manualmente.

## Formularios de terceros
Se pueden asignar sitios externos (uso estático: **no** reciben la variable `interaction`).
Requiere habilitar el dominio en *Configuración → Seguridad*:
- **Frame src**: dominios que uContact puede mostrar en iframe.
- **Frame ancestors**: sitios que pueden embeber uContact.
- **Connect src**: dominios/APIs a los que uContact (y los formularios) pueden enviar o pedir datos.
- **Access control allow origin**: dominios que pueden llamar a la API de uContact.

## Otros datos
- La plataforma resuelve el borrado de caché tras un nuevo build (no hace falta pedir a los agentes
  limpiar caché).
- La campaña también puede usar el CRM nativo de uContact en lugar de un formulario.
