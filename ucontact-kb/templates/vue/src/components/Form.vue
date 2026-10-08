<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  interaction: { type: Object, required: true }, // salida de normalizeInteraction()
  loading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "confirm"]);

/**
 * Configuración de campos.
 * source: "interaction" → campo raíz normalizado (clientId, clientName, channel, campaign...)
 *         "data"        → variable de la lista del marcador (interaction.data.X)
 *                         o campo extra del webchat (extraInfo.customFields.X)
 * lockWhenInteraction: solo lectura cuando hay interacción (editable en modo manual)
 */
const fields = [
  { key: "clientId",   label: "Id de cliente",     source: "interaction", required: true, lockWhenInteraction: true },
  { key: "clientName", label: "Nombre de cliente", source: "interaction" },
  { key: "channel",    label: "Canal",             source: "interaction", lockWhenInteraction: true },
  { key: "campaign",   label: "Campaña",           source: "interaction", lockWhenInteraction: true },
  { key: "Nombre",     label: "Nombre",            source: "data", required: true },
  { key: "Apellido",   label: "Apellido",          source: "data", required: true },
  { key: "Empresa",    label: "Empresa",           source: "data" },
];

const model = reactive({});
const errors = reactive({});

const readValue = (i, f) =>
  (f.source === "data" ? i.customData?.[f.key] : i[f.key]) ?? "";

// immediate: carga los valores apenas llega (o cambia) la interacción
watch(
  () => props.interaction,
  (i) => fields.forEach((f) => (model[f.key] = String(readValue(i, f)))),
  { immediate: true }
);

const isLocked = (f) => !!f.lockWhenInteraction && props.interaction.hasInteraction;

function validate() {
  let ok = true;
  for (const f of fields) {
    const empty = !String(model[f.key] ?? "").trim();
    errors[f.key] = f.required && empty ? "Campo obligatorio" : "";
    if (errors[f.key]) ok = false;
  }
  return ok;
}

function onSubmit() {
  if (validate()) emit("confirm", { ...model });
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <div class="fields">
      <p v-if="loading" class="loading">Cargando datos de la interacción…</p>

      <div v-for="field in fields" :key="field.key" class="row">
        <label :for="field.key">
          {{ field.label }}<span v-if="field.required" class="req" aria-hidden="true"> *</span>
        </label>
        <input
          :id="field.key"
          v-model="model[field.key]"
          type="text"
          :name="field.key"
          :readonly="isLocked(field)"
          :required="field.required"
          :aria-invalid="!!errors[field.key]"
          :aria-describedby="errors[field.key] ? field.key + '-err' : undefined"
          :class="{ invalid: errors[field.key] }"
        />
        <small v-if="errors[field.key]" :id="field.key + '-err'" class="msg">
          {{ errors[field.key] }}
        </small>
      </div>
    </div>

    <div class="actions">
      <button type="button" class="btn btn--secondary" @click="emit('close')">Cancelar</button>
      <button type="submit" class="btn btn--primary" :disabled="saving || loading">
        {{ saving ? "Guardando…" : "Confirmar" }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.form { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.fields {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4) var(--space-5);
  align-content: start;
}
.loading { grid-column: 1 / -1; color: var(--color-text-muted); }
.row { display: flex; flex-direction: column; gap: var(--space-1); }
label {
  font-size: var(--fs-label);
  font-weight: var(--fw-demibold);
  color: var(--color-text);
}
.req { color: var(--color-error); }
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
input[readonly] { background: var(--color-readonly-bg); color: var(--color-text-muted); }
input.invalid { border: 2px solid var(--color-error); }
/* El rosa no alcanza contraste AA en texto chico: el mensaje va en azul corporativo */
.msg { font-size: var(--fs-small); font-weight: var(--fw-demibold); color: var(--color-text); }
.msg::before { content: "● "; color: var(--color-error); }

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
