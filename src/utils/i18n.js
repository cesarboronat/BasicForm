// Traducciones simples (sin dependencias). Agregar claves en los tres idiomas.
import { ref } from "vue";

export const LANGUAGES = ["es", "pt", "en"];

const messages = {
  es: {
    pretitle: "Formulario",
    sectionInteraction: "Datos de la interacción",
    sectionList: "Datos del contacto",
    clientId: "Id de cliente",
    clientName: "Nombre de cliente",
    channel: "Canal",
    campaign: "Campaña",
    loading: "Cargando datos de la interacción…",
    manualMode: "Formulario abierto sin interacción activa (modo manual).",
    demoMode: "Modo demo: datos de ejemplo.",
    noListData: "La interacción no trae datos adicionales de la lista.",
    cancel: "Cancelar",
    confirm: "Confirmar",
    language: "Idioma",
  },
  pt: {
    pretitle: "Formulário",
    sectionInteraction: "Dados da interação",
    sectionList: "Dados do contato",
    clientId: "Id do cliente",
    clientName: "Nome do cliente",
    channel: "Canal",
    campaign: "Campanha",
    loading: "Carregando dados da interação…",
    manualMode: "Formulário aberto sem interação ativa (modo manual).",
    demoMode: "Modo demo: dados de exemplo.",
    noListData: "A interação não traz dados adicionais da lista.",
    cancel: "Cancelar",
    confirm: "Confirmar",
    language: "Idioma",
  },
  en: {
    pretitle: "Form",
    sectionInteraction: "Interaction data",
    sectionList: "Contact data",
    clientId: "Client ID",
    clientName: "Client name",
    channel: "Channel",
    campaign: "Campaign",
    loading: "Loading interaction data…",
    manualMode: "Form opened without an active interaction (manual mode).",
    demoMode: "Demo mode: sample data.",
    noListData: "The interaction has no additional list data.",
    cancel: "Cancel",
    confirm: "Confirm",
    language: "Language",
  },
};

const STORAGE_KEY = "basicform.lang";

const pick = (code) => {
  const short = String(code || "").slice(0, 2).toLowerCase();
  return LANGUAGES.includes(short) ? short : null;
};

function initialLang() {
  try {
    const saved = pick(localStorage.getItem(STORAGE_KEY));
    if (saved) return saved;
  } catch {}
  return pick(navigator.language) || "es";
}

export const lang = ref(initialLang());

// lockToUser: true cuando el agente eligió el idioma a mano (se recuerda en el navegador)
export function setLang(code, { lockToUser = false } = {}) {
  const next = pick(code);
  if (!next) return;
  if (!lockToUser) {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return; // respetar la elección del agente
    } catch {}
  }
  lang.value = next;
  document.documentElement.lang = next;
  if (lockToUser) {
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }
}

export const t = (key) => messages[lang.value]?.[key] ?? messages.es[key] ?? key;

document.documentElement.lang = lang.value;
