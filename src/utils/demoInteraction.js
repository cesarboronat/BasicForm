// Interacción de ejemplo para probar fuera de la Inbox: abrir el formulario con ?demo
// (ej. Open test → .../test/?demo). Simula una llamada del marcador con variables de lista.
export const demoInteraction = {
  guid: "00000000-0000-0000-0000-000000000000",
  channel: "telephony",
  campaign: "Demo",
  clientId: "59899123456",
  clientName: "",
  form: "",
  data: {
    Nombre: "Ana",
    Apellido: "Pereira",
    Empresa: "Acme S.A.",
    Deuda: 15400,
    Vencimiento: "2026-11-30",
    Plan: "Premium",
    DIALER: "VistaPrevia",
    DIALERTYPE: "Preview",
    CAMPAIGN: "{\"name\":\"Demo\",\"language\":\"es\"}",
  },
};
