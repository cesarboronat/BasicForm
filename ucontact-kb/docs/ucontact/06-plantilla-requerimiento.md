# 06 — Plantilla de requerimiento y checklist de entrega

Copiá esta plantilla en el chat (o en `REQUERIMIENTO.md` del proyecto) para pedir un formulario.

```markdown
## Formulario: <nombre>
- Vertical / negocio: <cobranzas | ventas | soporte | salud | seguros | ...>
- Tipo de proyecto: <Vue | React | JavaScript>   (si no se indica: el del proyecto base)
- Campaña(s): <nombre>
- Canales activos en la campaña: <telephony, whatsapp, webchat, ...>
- Instancia: https://<instancia>.ucontactcloud.com

### Objetivo
<qué tiene que resolver el agente con este formulario>

### Datos que se muestran (solo lectura)
| Campo | Origen (interaction / lista del marcador / webhook / API externa) |
|---|---|

### Datos que carga el agente
| Campo | Tipo | Obligatorio | Validación | Valores posibles |
|---|---|---|---|---|

### Reglas de negocio
- <condiciones, campos dependientes, cálculos>

### Persistencia
- ¿Guardar en cccustom? <sí/no> — tabla sugerida: <nombre>
- ¿Enviar a sistema externo? <URL / método / auth>

### Acciones
- Confirmar: <qué pasa>
- Cancelar: <qué pasa>
- Otras: <ej. buscar cliente por documento, agendar rellamado>

### Apertura manual (sin interacción)
<permitida / no permitida — qué debe hacer>

### Marca
<net2phone/uContact (por defecto) | marca del cliente final: colores, logo, tipografía>
```

## Checklist de entrega (Claude debe verificar antes de responder)
- [ ] Usa `useIframe().getInteraction()` y maneja timeout / ausencia de interacción.
- [ ] Usa `normalizeInteraction()`; funciona en todos los canales declarados.
- [ ] Parsea `CAMPAIGN` / `CONTACT` con manejo de error; booleanos string convertidos.
- [ ] No implementa tipificaciones.
- [ ] Toda lectura/escritura de BD va por webhook; escritura solo en `cccustom`.
- [ ] Especificación de cada webhook (body, respuesta, SQL, pasos del flujo) incluida.
- [ ] DDL de tablas `cccustom` incluido (con índices y `created_at` UTC).
- [ ] Sin secretos de terceros en el frontend.
- [ ] Dominios para *Connect src* / *Frame src* listados.
- [ ] Validaciones de campos y mensajes de error claros; estado de carga/guardado.
- [ ] Botones Cancelar → `close()`, Confirmar → guardar + `sent()`.
- [ ] Branding aplicado con `tokens.css` (sin colores hardcodeados), logo uContact, sin Camel Case en títulos.
- [ ] Responsive y accesible (labels, foco, contraste).
- [ ] Pasos de prueba: Servir → Open test → Compilar → asignar en campaña.
- [ ] Supuestos y puntos "por verificar" listados al final.
