<script setup>
import { ref, computed, onMounted } from "vue";
import Form from "./components/Form.vue";
import { useIframe } from "./utils";
import { normalizeInteraction } from "./utils/normalizeInteraction";
import { demoInteraction } from "./utils/demoInteraction";
import { LANGUAGES, lang, setLang, t } from "./utils/i18n";

import "./assets/brand/tokens.css";
import logo from "./assets/brand/ucontact-logo-secondary.png";

const raw = ref(null);
const loading = ref(true);
const isDemo = new URLSearchParams(window.location.search).has("demo");

// Siempre trabajar con la versión normalizada (independiente del canal)
const interaction = computed(() => normalizeInteraction(raw.value));
// Sin interacción, el nombre sale de la URL publicada: /forms/<NombreProyecto>/
const pathParts = window.location.pathname.split("/").filter(Boolean);
const nameFromPath = pathParts.includes("forms") ? pathParts[pathParts.indexOf("forms") + 1] : "";
const title = computed(() => interaction.value.formName || nameFromPath || "uContact");

onMounted(async () => {
  try {
    raw.value = isDemo ? demoInteraction : await useIframe().getInteraction();
  } catch (err) {
    // Apertura manual desde la barra lateral o timeout (5 s): modo manual
    console.warn("Formulario sin interacción:", err);
    raw.value = null;
  } finally {
    loading.value = false;
  }
  // Idioma por defecto: el de la campaña (si el agente no eligió otro)
  setLang(interaction.value.campaignConfig?.language);
});

// Solo vista previa: no se guarda nada
const close = () => useIframe().close();
const confirm = () => useIframe().sent();
</script>

<template>
  <div class="layout">
    <header class="header">
      <img class="logo" :src="logo" alt="uContact" />
      <div class="heading">
        <span class="n2p-pretitle">{{ t("pretitle") }}</span>
        <h1 class="title">{{ title }}</h1>
      </div>
      <div class="langs" role="group" :aria-label="t('language')">
        <button
          v-for="code in LANGUAGES"
          :key="code"
          type="button"
          class="lang"
          :class="{ active: lang === code }"
          :aria-pressed="lang === code"
          @click="setLang(code, { lockToUser: true })"
        >
          {{ code.toUpperCase() }}
        </button>
      </div>
    </header>
    <div class="n2p-gradient-line" aria-hidden="true"></div>

    <p v-if="isDemo" class="banner">{{ t("demoMode") }}</p>
    <p v-else-if="!loading && !interaction.hasInteraction" class="banner">
      {{ t("manualMode") }}
    </p>

    <Form :interaction="interaction" :loading="loading" @close="close" @confirm="confirm" />
  </div>
</template>

<style>
* { margin: 0; box-sizing: border-box; }
html, body, #app { height: 100%; }
body {
  font-family: var(--font-family);
  font-weight: var(--fw-light);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: var(--color-text);
  background: var(--color-bg);
}
</style>

<style scoped>
.layout { display: flex; flex-direction: column; height: 100%; }
.header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  background: var(--color-bg);
}
/* El PNG ya incluye la zona de protección del logo */
.logo { height: 36px; width: auto; flex: none; }
.heading { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.title {
  font-size: var(--fs-h2);
  line-height: var(--lh-h2);
  font-weight: var(--fw-black);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.langs {
  display: flex;
  flex: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.lang {
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: var(--fw-bold);
  color: var(--color-text);
  background: var(--color-bg);
  border: none;
  padding: var(--space-1) var(--space-3);
  cursor: pointer;
}
.lang:hover { background: var(--n2p-gray-50); }
.lang.active { background: var(--color-button-bg); color: var(--color-button-text); }
.lang:focus-visible { outline: 3px solid var(--color-focus); outline-offset: -3px; }
.banner {
  margin: var(--space-3) var(--space-5) 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-info-bg);
  font-weight: var(--fw-regular);
}
</style>
