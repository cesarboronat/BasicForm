<script>
import Form from "./components/Form.vue";
import { useIframe } from "./utils";
import { ref, onMounted, computed } from "vue";
export default {
  components: {
    Form,
  },
  setup() {
    const form = ref(null);
    const interaction = ref({});
    onMounted(async () => {
      let i = await useIframe().getInteraction();
      console.log(i);
      interaction.value = i;
      console.log(interaction.value);
    });

    const close = () => {
      useIframe().close();
    };
    const confirm = () => {
      useIframe().sent();
    };

    const title = computed(() => {
      return interaction.value && interaction.value.form
        ? interaction.value.form.split("/")[
            interaction.value.form.split("/").length - 2
          ]
        : "uContact form";
    });
    return { interaction, title, close, confirm };
  },
};
</script>

<template>
  <div class="header">
    <img alt="uContactLogo" src="./assets/icons/uContact.png" width="40" />
    <h2 style="text-align: center; flex: 1">
      {{ title }}
    </h2>
    <img
      alt="vueLogo"
      src="./assets/icons/vue.svg"
      width="40"
      style="margin-left: auto"
    />
  </div>
  <Form :interaction="interaction" @close="close" @confirm="confirm" />
</template>

<style>
* {
  margin: 0;
  box-sizing: border-box;
}
html,
body {
  height: 100%;
}
#app {
  height: calc(100% - 4rem);
}
</style>
<style scoped>
.header {
  width: 100%;
  height: 4rem;
  background: #0095ff;
  display: flex;
  align-items: center;
}
.header img {
  margin: 0 10px;
}
.header h2 {
  color: white;
  font-family: "Segoe UI";
  font-weight: 300;
  font-size: 2rem;
}
</style>
