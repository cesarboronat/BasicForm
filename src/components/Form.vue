<script setup>
import { ref, watch } from "vue";
const emit = defineEmits(["confirm"]);

const props = defineProps(["interaction"]);

const interaction = ref({});

const fields = ref([
  { text: "Client Id", value: "clientId" },
  { text: "Client name", value: "clientName" },
  { text: "Channel", value: "channel" },
  { text: "Campaign", value: "campaign" },
]);

const fieldsData = ref([
  { text: "Nombre", value: "Nombre" },
  { text: "Apellido", value: "Apellido" },
  { text: "Empresa", value: "Empresa" },
]);

watch(
  () => props.interaction,
  (newValue) => {
    interaction.value = newValue;
  }
);

const validate = () => {
  let valid = true;
  fields.value.forEach((field) => {
    let input = document.getElementById(field.value);
    let label = document.getElementById("label" + field.value);
    if (!input.value) {
      label.classList.add("error");
      input.classList.add("error");
      valid = false;
      return false;
    }
    label.classList.remove("error");
    input.classList.remove("error");
  });
  if (valid) {
    emit("confirm");
  }
};
</script>

<template>
  <form class="form" action="javascript:void(0);">
    <div class="row" v-for="(field, index) in fields" :key="index">
      <label :for="field.value" :id="'label' + field.value">
        {{ field.text }}
      </label>
      <input
        type="text"
        :name="field.value"
        :id="field.value"
        v-model="interaction[field.value]"
      />
    </div>

    <div class="row" v-for="(field, index) in fieldsData" :key="index">
      <label :for="field.value" :id="'label' + field.value">
        {{ field.text }}
      </label>
      <input
        type="text"
        :name="field.value"
        :id="field.value"
        v-model="interaction.data[field.value]"
      />
    </div>
  
  <!-- Los botones podrian quedan comentados porque no hacen nada particular -->
    <div class="buttonContainer">
      <button @click="$emit('close')" class="cancel">Cancel</button>
      <button @click="validate" class="confirm">Confirm</button>
    </div>
  
  </form>
</template>

<style scoped>
.form {
  margin: 0 auto;
  width: 100%;
  height: 100%;

  position: relative;
}
.row {
  margin: 0 auto;
  width: 80%;
  padding: 0.5rem;
  /* background: red; */
}
.buttonContainer {
  position: absolute;
  width: 100%;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 0;
}
.buttonContainer button {
  width: 37.5%;
  margin: 0 2.5%;
  height: 2rem;
  border: 1px solid rgb(37, 37, 37);
  border-radius: 1rem;
  transition: 0.5s;
}
.buttonContainer .confirm {
  color: white;
  border: none;
  background: #0095ff;
}
.buttonContainer .confirm:hover {
  background: #026db9;
}
.buttonContainer .cancel {
  background: #ffff;
}
.buttonContainer .cancel:hover {
  background: rgb(197, 197, 197);
}
label {
  font-family: Verdana, sans-serif;
  font-size: 1rem;
}
input {
  margin: 5px auto;
  padding-left: 5px;
  border: 1px solid rgb(37, 37, 37);
  border-radius: 5px;
  width: 100%;
  height: 2rem;
  transition: 0.5s !important;
}
input:focus {
  border: 1px solid #0095ff !important;
  outline: none;
}
.error {
  color: #f44349;
}

input.error {
  color: black;
  border: 1px solid #f44349 !important;
}
</style>
