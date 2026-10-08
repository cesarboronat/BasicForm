<script setup>
import { reactive, computed, watch } from "vue";
import { t } from "../utils/i18n";

const props = defineProps({
  interaction: { type: Object, required: true }, // salida de normalizeInteraction()
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "confirm"]);

// Campos fijos de la interacción (label traducido con la misma clave)
const baseFields = ["clientId", "clientName", "channel", "campaign"];

// Campos de la lista del marcador: se generan con lo que llegue en la interacción.
// El label es el nombre exacto de la columna cargada como "Parámetro".
const listFields = computed(() => Object.keys(props.interaction.customData || {}));

const model = reactive({});

// immediate: carga los valores apenas llega (o cambia) la interacción
watch(
  () => props.interaction,
  (i) => {
    for (const key of baseFields) model[key] = String(i[key] ?? "");
    for (const [key, value] of Object.entries(i.customData || {})) {
      model["data." + key] = value == null ? "" : String(value);
    }
  },
  { immediate: true }
);

// Con interacción los datos son solo lectura (vista previa); en modo manual se pueden completar
const readonly = computed(() => !!props.interaction.hasInteraction);
</script>

<template>
  <form class="form" novalidate @submit.prevent="emit('confirm')">
    <div class="body">
      <p v-if="loading" class="muted">{{ t("loading") }}</p>

      <section>
        <h2 class="section-title">{{ t("sectionInteraction") }}</h2>
        <div class="grid">
          <div v-for="key in baseFields" :key="key" class="row">
            <label :for="key">{{ t(key) }}</label>
            <input :id="key" v-model="model[key]" type="text" :name="key" :readonly="readonly" />
          </div>
        </div>
      </section>

      <section v-if="!loading && interaction.hasInteraction">
        <h2 class="section-title">{{ t("sectionList") }}</h2>
        <div v-if="listFields.length" class="grid">
          <div v-for="key in listFields" :key="key" class="row">
            <label :for="'data-' + key">{{ key }}</label>
            <input
              :id="'data-' + key"
              v-model="model['data.' + key]"
              type="text"
              :name="key"
              :readonly="readonly"
            />
          </div>
        </div>
        <p v-else class="muted">{{ t("noListData") }}</p>
      </section>
    </div>

    <div class="actions">
      <button type="button" class="btn btn--secondary" @click="emit('close')">{{ t("cancel") }}</button>
      <button type="submit" class="btn btn--primary" :disabled="loading">{{ t("confirm") }}</button>
    </div>
  </form>
</template>

<style scoped>
.form { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.section-title {
  font-size: var(--fs-h3);
  font-weight: var(--fw-extrabold);
  color: var(--color-text);
  margin-bottom: var(--space-3);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4) var(--space-5);
}
.muted { color: var(--color-text-muted); }
.row { display: flex; flex-direction: column; gap: var(--space-1); min-width: 0; }
label {
  font-size: var(--fs-label);
  font-weight: var(--fw-demibold);
  color: var(--color-text);
  overflow-wrap: anywhere;
}
input {
  font-family: inherit;
  font-size: var(--fs-input);
  line-height: var(--lh-input);
  font-weight: var(--fw-regular);
  color: var(--color-text);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:hover:not([readonly]) { border-color: var(--color-border-strong); }
input:focus {
  outline: none;
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--n2p-blue-100);
}
input[readonly] { background: var(--color-readonly-bg); }

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--n2p-gray-100);
}
.btn {
  font-family: inherit;
  font-size: var(--fs-button);
  font-weight: var(--fw-bold);
  min-width: 140px;
  height: 40px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.btn:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
.btn--primary {
  background: var(--color-button-bg);
  color: var(--color-button-text);
  border: 1px solid var(--color-button-bg);
}
.btn--primary:hover:not(:disabled) { background: var(--n2p-navy-600); border-color: var(--n2p-navy-600); }
.btn--primary:disabled { background: var(--color-disabled); border-color: var(--color-disabled); cursor: default; }
.btn--secondary {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-text);
}
.btn--secondary:hover { background: var(--n2p-gray-50); }

/* Evita zoom automático en iOS al enfocar inputs */
@media (max-width: 600px) {
  input { font-size: 16px; }
  .actions { flex-direction: column-reverse; }
  .btn { width: 100%; }
}
</style>
