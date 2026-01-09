<script setup>
import {ref} from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";
import { useRoute } from "vue-router";
const router = useRoute();
const btnDisabled = ref(false);
const successMessage = ref("");
const isVisible = ref(true);
const confirmFromBackend = ref(false);

const accepted = ref(false);

async function confirmMietvertrag() {
  console.log("confirmMietvertrag")
  if(!accepted.value) {
    alert("Sie müssen den Bedingungen zustimmen")
    return;
  }

  const token = router.query.token;
  let response;

  try {
      response = await AuthenticationService.confirmMietvertrag({
      token: token,
      accepted: true,
    });

    if(response.data.confirm === true) {
      successMessage.value = response.data.message //Verarbeitet die Antwort vom Backend und gibt diese aus!
      btnDisabled.value = true;
      confirmFromBackend.value = true; //Wenn Backend den Token bestätigt hat, wird die Anzeige im Card-Item umgestellt
    }
    console.log("data", response.data);
  } catch (err) {
    const data = err?.response?.data;
    if (data?.confirm === false) {
      alert(data.message);
      btnDisabled.value = true;
      isVisible.value = false;
    }

    console.log("confirm error", err?.response?.status, err?.response?.data || err.message);
  }


}

</script>

<template>
  <v-card
      class="mx-auto my-8"
      elevation="16"
      max-width="344"
  >
    <v-card-item>
      <v-card-title>
        Mietvertrag
      </v-card-title>

      <v-card-subtitle>
        Bitte bestätigen
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      Ich bestätige den Erhalt des Mietvertrags und akzeptiere die darin enthaltenen Vertragsbedingungen.
    </v-card-text>

    <v-card-item class="pb-0">
      <v-checkbox
          v-if="!confirmFromBackend"
          v-model="accepted"
          label="Ich akzeptiere die Bedingungen"
          class="my-0"
          hide-details
          density="compact"
      />
      <div v-else>{{ successMessage }}</div>
    </v-card-item>

    <v-card-item class="pt-0 d-flex justify-center">
      <v-btn
          class="text-none text-subtitle-1"
          color="#5865f2"
          size="large"
          variant="flat"
          :disabled="btnDisabled"
          @click="confirmMietvertrag"
      >
        Bestätigen
      </v-btn>
    </v-card-item>


  </v-card>
</template>

<style scoped>

</style>