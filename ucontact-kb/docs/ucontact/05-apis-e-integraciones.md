# 05 — APIs e integraciones

## Desde el formulario
- Se pueden invocar **APIs externas** y la **API de uContact** con `fetch` desde cualquier tipo de proyecto.
- El dominio de cada API externa debe estar en *Configuración → Seguridad → Connect src*.
- Credenciales de terceros: **no** exponerlas en el frontend. Preferir pasar por un webhook que use
  la actividad *WebService* (el secreto queda en el flujo).
- Ejemplo base:
```js
try {
  const response = await fetch("https://api.externa.com/clientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.value, email: email.value }),
  });
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const json = await response.json();
} catch (e) {
  // mostrar error al agente
}
```

## API pública de uContact (requiere token)
Header: `authorization: Bearer <TOKEN>` (token generado en la plataforma). Documentación oficial
enlazada en el material de capacitación ("DOCUMENTACIÓN").

### Cargar lista a un marcador
`POST https://<instancia>.ucontactcloud.com/api/dialers/id/{OutboundHub}/lists`
```json
{
  "filename": "Nombre de la lista",
  "list": [
    { "clientIds": ["59899000000"], "timezone": "America/Montevideo",
      "data": { "cedula": 47123121, "nombre": "Martin García" },
      "contactId": "opcional", "agent": "opcional (solo Preview)" }
  ]
}
```

### Cargar leads (contacto inmediato)
`POST https://<instancia>.ucontactcloud.com/api/dialers/id/{OutboundHub}/freshLeads`
```json
{ "leads": [ { "clientIds": ["59899305005"], "data": { "nombre": "Walter Perez" } } ] }
```
Lo que va en `data` aparece luego en `interaction.data` del formulario.

> Un formulario puede, por ejemplo, agendar un nuevo contacto para otro Hub mediante `freshLeads`.
> Como requiere token, hacerlo a través de un webhook y no desde el navegador.

## Webhooks propios
Ver `04-datos-y-webhooks.md`. No requieren token; misma forma de invocación que una API.

## Si falta un endpoint
Se puede solicitar al equipo de producto la incorporación de nuevos métodos a la API.
