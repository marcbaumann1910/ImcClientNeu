<script setup>
import {ref} from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";
import { useRoute } from "vue-router";
const router = useRoute();


const accepted = ref(false);

async function confirmMietvertrag() {
  console.log("confirmMietvertrag")
  if(!accepted.value) {
    alert("Sie müssen den Bedingungen zustimmen")
    return;
  }

  const token = router.query.token;

  try {
    const response = await AuthenticationService.confirmMietvertrag({
      token: token,
      accepted: true,
    });
    console.log("data", response.data);
  } catch (err) {
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
      Hiermit bestätige ich den Erhalt und die Vertragsbedingungen aus dem mir vorliegenden Mietvertrag
    </v-card-text>


    <v-card-item  class="d-flex justify-center">
      <v-btn
          class="text-none text-subtitle-1"
          color="#5865f2"
          size="large"
          variant="flat"
          @click="confirmMietvertrag"
      >
        Bestätigen
      </v-btn>
    </v-card-item>

    <v-card-item>
      <v-checkbox v-model="accepted" label="Ich akzeptiere die Bedingungen" />
    </v-card-item>


  </v-card>
</template>

<style scoped>

</style>