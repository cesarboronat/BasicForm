<script setup>
import { ref, computed, onMounted } from "vue";
import Form from "./components/Form.vue";
import { useIframe } from "./utils";
import { normalizeInteraction } from "./utils/normalizeInteraction";
// import { callWebhook } from "./utils/webhook";

// Marca: tokens + Open Sans local (yarn add @fontsource/open-sans)
import "./assets/brand/tokens.css";
import "@fontsource/open-sans/latin-300.css";
import "@fontsource/open-sans/latin-400.css";
import "@fontsource/open-sans/latin-600.css";
import "@fontsource/open-sans/latin-700.css";
import "@fontsource/open-sans/latin-800.css";
import logo from "./assets/brand/assets/ucontact-logo-secondary.png";

const raw = ref(null);
const loading = ref(true);
const saving = ref(false);
const errorMsg = ref("");

// Siempre trabajar con la versión normalizada (independiente del canal)
const interaction = computed(() => normalizeInteraction(raw.value));
// Sin interacción, el nombre sale de la URL publicada: /forms/<NombreProyecto>/
const pathParts = window.location.pathname.split("/").filter(Boolean);
const nameFromPath = pathParts[pathParts.indexOf("forms") + 1] || "";
const title = computed(() => interaction.value.formName || nameFromPath || "uContact");

onMounted(async () => {
  try {
    raw.value = await useIframe().getInteraction();
  } catch (err) {
    // Apertura manual desde la barra lateral o timeout (5 s): modo manual
    console.warn("Formulario sin interacción:", err);
    raw.value = null;
  } finally {
    loading.value = false;
  }
});

const close = () => useIframe().close();

async function confirm(values) {
  errorMsg.value = "";
  saving.value = true;
  try {
    // Persistencia vía webhook (ver docs/ucontact/04-datos-y-webhooks.md):
    // await callWebhook("basicform_save", {
    //   guid: interaction.value.guid ?? "",
    //   campaign: interaction.value.campaign ?? "",
    //   channel: interaction.value.channel ?? "",
    //   payload: values,
    // });
    useIframe().sent();
  } catch (err) {
    console.error(err);
    errorMsg.value = "No se pudo guardar. Intente nuevamente.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <img class="logo" :src="logo" alt="uContact" />
      <div class="heading">
        <span class="n2p-pretitle">Formulario</span>
        <h1 class="title">{{ title }}</h1>
      </div>
    </header>
    <div class="n2p-gradient-line" aria-hidden="true"></div>

    <p v-if="!loading && !interaction.hasInteraction" class="banner">
      Formulario abierto sin interacción activa (modo manual).
    </p>
    <p v-if="errorMsg" class="banner banner--error" role="alert">{{ errorMsg }}</p>

    <Form
      :interaction="interaction"
      :loading="loading"
      :saving="saving"
      @close="close"
      @confirm="confirm"
    />
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
.heading { display: flex; flex-direction: column; min-width: 0; }
.title {
  font-size: var(--fs-h2);
  line-height: var(--lh-h2);
  font-weight: var(--fw-black);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.banner {
  margin: var(--space-3) var(--space-5) 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-info-bg);
  font-weight: var(--fw-regular);
}
.banner--error {
  background: var(--color-error-bg);
  border-left: 3px solid var(--color-error);
}
</style>
