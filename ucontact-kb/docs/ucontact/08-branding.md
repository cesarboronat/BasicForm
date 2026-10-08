# 08 — Branding net2phone / uContact (Manual de marca v2.1)

Aplica a **todos** los formularios, salvo que el requerimiento pida explícitamente la marca del
cliente final. Implementación lista en `templates/brand/` (`tokens.css` + logos).

## Colores

| Rol | Color | Uso en formularios |
|---|---|---|
| Azul corporativo | `#002540` | Texto, títulos, labels, íconos, **fondo de botón primario** |
| Blanco | `#FFFFFF` | Fondo principal |
| Rosa | `#FE0687` | Acento / degradado. En formularios: borde de error, asterisco de obligatorio |
| Violeta | `#740CE8` | Acento / degradado |
| Azul | `#0095FF` | Acento / degradado. En formularios: anillo de foco |
| Tonos claros | `#FFDAED` `#E0CAFA` `#CCEAFF` | Fondos de avisos (error, info) |
| Tonos medios | `#FF69B7` `#A562F0` `#61BDFF` | Acentos secundarios |
| Azul oscuro medio | `#435E72` (texto secundario) · `#C5CDD4` (bordes) | |
| Neutros | `#000` `#0E1112` `#242526` `#272829` `#393B3C` `#505253` `#686A6B` `#818384` `#9B9D9E` `#B6B8B9` `#EFEFEF` `#F5F5F5` | Superficies, divisores, deshabilitado |

Reglas:
- **Solo colores de la paleta.** Todos admiten opacidad 0–100 %.
- Rosa, violeta y azul **no** se usan como fondos sólidos ni en cuerpo de texto.
- Accesibilidad (contraste sobre blanco): `#002540` 15.7:1 ✓ · `#435E72` 6.8:1 ✓ ·
  `#740CE8` 7.1:1 ✓ · `#FE0687` 3.8:1 y `#0095FF` 3.1:1 ✗ para texto chico.
  Por eso: **botones en `#002540` con texto blanco** (no azul `#0095FF` con texto blanco, como el
  base de la plataforma) y mensajes de error en azul corporativo con marcador rosa.

## Degradados
- Principal: `#FE0687 → #740CE8 → #0095FF` (33 % cada uno). Secundario: los mismos al 20 % de opacidad sobre blanco.
- **Orden de colores fijo**; no crear otras combinaciones.
- Usos permitidos en UI: borde de caja de 2 px, línea/subrayado bajo un título Extra Bold, una
  palabra de un título en Extra Bold, línea de tiempo. Usar **con moderación** (un recurso por pantalla;
  nunca palabra en degradado + subrayado en degradado en el mismo título).
- No usar como fondo de párrafos ni detrás de texto.
- Utilidades CSS: `.n2p-gradient-line`, `.n2p-gradient-border`, `.n2p-gradient-word`.

## Tipografía
- Principal **IDT Sans** (propietaria, normalmente no disponible en web). Reemplazo oficial: **Open Sans**.
- En los formularios: `@fontsource/open-sans` (subconjunto latino, pesos 300–800) empaquetado
  localmente → no depende de Google Fonts ni de permisos de dominio. `yarn add @fontsource/open-sans`.
- Pesos: títulos Extra Bold/Black (800) · cuerpo Light (300) · labels/pretítulos DemiBold (600) ·
  botones y links Bold (700).
- Escala del manual: H1 22 · H2 18 · H3 14 · H4 13 · H5 10 · pretítulo 10 MAYÚS DemiBold ·
  cuerpo 12 · botones 10. Para formularios operativos se usa inputs 14 px y botones 12 px
  (*ajuste propio por legibilidad, validar con Marketing*); 16 px en inputs móviles para evitar el zoom de iOS.
- Interlineado = tamaño + 6 px.
- Texto **alineado a la izquierda** (nunca justificado en interfaces).
- En español: **sin Camel Case** en títulos ("Datos del cliente", no "Datos Del Cliente").
- Nombres de marca/producto (net2phone, uContact) en Bold dentro del texto.

## Logos

| Archivo (`templates/brand/assets/`) | Versión | Cuándo |
|---|---|---|
| `ucontact-logo-primary.png` | Azul corporativo | Predeterminada sobre fondos claros |
| `ucontact-logo-secondary.png` | Azul + isotipo en degradado | Cuando la pantalla tiene pocos degradados (usada en el header de la plantilla) |
| `ucontact-logo-white.png` | Blanco | Fondos oscuros (`#002540`) |
| `net2phone-logo-primary.png` | Azul corporativo | Predeterminada de la marca corporativa |
| `net2phone-logo-secondary.png` | Azul + "2" en degradado | Pocos degradados en la pieza |
| `net2phone-logo-white.png` | Blanco | Fondos oscuros |

- En formularios embebidos en la Inbox usar el **logo de uContact** (es el producto); net2phone solo
  si el requerimiento lo pide.
- Los PNG ya incluyen la zona de protección: **no recortarlos**, no poner nada encima ni pegado.
- Prohibido: estirar, deformar, cambiar colores, transparencias, sombras, rotar, cambiar la dirección del
  degradado, usar la versión en degradado sobre fondo oscuro.
- Tamaño mínimo digital del isotipo: 40 px de ancho. En el header se usa el logo a 36 px de alto.
- El ícono rojo `uContact.png` y el logo de Vue del proyecto base son de la identidad anterior / del
  framework: **reemplazarlos**.
- Uso de la marca fuera de net2phone (partners, clientes) requiere autorización escrita de Legal.

## Íconos
- Biblioteca oficial **MyIcons** (no mezclar con otras). Tamaños: 24 px (trazo 1.5), 28 px (1.75), 32 px (2).
- Sin bordes, sombras, degradados ni rellenos de otro color. Color: azul corporativo.
- Si no hay acceso a MyIcons en el proyecto, **no usar íconos** antes que usar otra biblioteca.

## Componentes base de la plantilla

| Elemento | Especificación |
|---|---|
| Header | Fondo blanco · logo uContact secundario 36 px · pretítulo "FORMULARIO" · título H2 800 `#002540` · línea degradado 2 px debajo |
| Label | 12 px · 600 · `#002540` · asterisco rosa en obligatorios |
| Input | 14 px · 400 · borde `#C5CDD4` · radio 6 px · foco borde `#0095FF` + halo `#CCEAFF` · solo lectura fondo `#F5F5F5` |
| Error | Borde 2 px `#FE0687` · mensaje 10 px 600 `#002540` con "●" rosa |
| Aviso | Fondo `#CCEAFF` (info) o `#FFDAED` + borde izquierdo rosa (error) |
| Botón primario | Píldora · fondo `#002540` · texto blanco 12 px 700 · hover `#435E72` |
| Botón secundario | Píldora · fondo blanco · borde y texto `#002540` |
| Layout | Grilla responsive `minmax(240px, 1fr)` · acciones abajo a la derecha (apiladas en móvil) |

Referencia visual: `img/plantilla-vue-escritorio.png` y `img/plantilla-vue-movil-manual.png`.
