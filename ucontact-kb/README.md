# Base de conocimiento uContact X para desarrollo de formularios con Claude

## Cómo usarla
1. Copiá `CLAUDE.md` y la carpeta `docs/` a la raíz de cada proyecto de formulario
   (o a un repositorio plantilla del que clones los proyectos).
2. Abrí el proyecto en VS Code con Claude Code. Claude Code lee `CLAUDE.md` automáticamente al iniciar.
3. Primer pedido sugerido: *"Analizá el proyecto base y actualizá docs/ucontact/02-formularios.md con
   lo que encuentres en utils/ y js/formManager.js."*
4. Luego pedí formularios con la plantilla de `docs/ucontact/06-plantilla-requerimiento.md`.

## Plantilla Vue
`templates/vue/src/` contiene la versión corregida de `App.vue`, `components/Form.vue`, dos utilidades
(`normalizeInteraction.js`, `webhook.js`) y `assets/brand/`. Agregar la fuente con `yarn add @fontsource/open-sans`
y borrar los logos viejos (`assets/icons/uContact.png`, `vue.svg`). Copiarlas sobre un proyecto Vue recién creado en la
plataforma; el resto de archivos (incluido `vite.config.js`) se mantiene el generado.

## Marca
`templates/brand/` contiene `tokens.css` (paleta, degradados, tipografía, espaciado) y los logos
oficiales de net2phone y uContact. Las reglas están en `docs/ucontact/08-branding.md`.

## Mantenimiento
Los puntos marcados **"por verificar"** no están cubiertos por la documentación oficial
(p. ej. sintaxis del body en webhooks, campo `lastMessage.source`, acción `sent`).
Cuando los confirmes con un caso real, actualizá el `.md` correspondiente para que todos los
proyectos se beneficien.

## Fuentes
Material de capacitación uContact X (net2phone): Conceptos Generales, Arquitectura y Seguridad,
Administración, Agentes, Supervisión, Marcadores, Base de Datos, Desarrollo de Flujos,
Desarrollo de Formularios, Personalizaciones e Integraciones.
