<template>
  <v-form ref="formNames" v-model="valid" lazy-validation>
    <div>
      <!--    <v-img-->
      <!--        class="mx-auto my-6"-->
      <!--        max-width="228"-->
      <!--        src="https://cdn.vuetifyjs.com/docs/images/logos/vuetify-logo-v3-slim-text-light.svg"-->
      <!--    ></v-img>-->

      <v-card
          class="mx-auto pa-12 pb-8 mt-16"
          elevation="8"
          max-width="448"
          rounded="lg"

      >
        <div class="text-subtitle-1 text-medium-emphasis">Account</div>
        <div class="text-field-container">
          <v-text-field
              class="txtField"
              v-model="txtEmail"
              density="compact"
              placeholder="Email-Adresse"
              prepend-inner-icon="mdi-email-outline"
              :rules="emailRules"
              variant="filled"
          ></v-text-field>
        </div>

        <div
            class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between"
        >
          Passwort
        </div>

        <div class="text-field-container">
          <v-text-field
              class="txtField"
              v-model="txtPasswort"
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              density="compact"
              placeholder="Passwort"
              prepend-inner-icon="mdi-lock-outline"
              variant="filled"
              :rules="passwortRules"
              @click:append-inner="visible = !visible"
          ></v-text-field>

        </div>

        <div>
          <v-card-text class="text-center">
            <router-link
                class="text-blue text-decoration-none"
                :to="{ name: 'register' }"
            >
              Passwort vergessen ?
            </router-link>
          </v-card-text>
        </div>

        <v-btn
            @click="login()"
            class="mb-8 mt-4"
            color="primary"
            size="large"
            block
            :loading="isLoading"
        >
          Login
        </v-btn>



        <v-card-text class="text-center">
          <router-link
              class="text-blue text-decoration-none"
              :to="{ name: 'register' }"
          >
            Jetzt registrieren <v-icon icon="mdi-chevron-right"></v-icon>
          </router-link>
        </v-card-text>
      </v-card>

    </div>
  </v-form>
</template>

<script setup>
import { ref } from 'vue';
import AuthenticationService from "@/services/AuthenticationService.js";

const visible = ref(false);
const txtPasswort = ref('');
const txtEmail = ref('');
const formNames = ref(null);
const valid = ref(false);
const passwortRules = [(v) => !!v || 'Passwort ist erforderlich'];
const emailRules = [(v) => !!v || 'Email ist erforderlich'];
const isLoading = ref(false);


async function login(){
  isLoading.value = true;
  if(txtPasswort.value.length === 0) {
    isLoading.value = false;
    return;
  }
  if(txtEmail.value.length === 0) {
    isLoading.value = false;
    return;
  }
  try {
//info@masrc79.net
// Hallo-2024!
    const response = await AuthenticationService.login(
        {
          email: txtEmail.value,
          password: txtPasswort.value
        }
    )

    isLoading.value = false;

    if(response.data === "authentication accepted")
    {
      console.log("authentication accepted");
    }

    console.log('response',response)

  } catch(err)
  {
    isLoading.value = false;
    console.log('Email oder Passwort ist falsch!')
  }

}




</script>

<style scoped>
.text-field-container {
  display: flex;
  justify-content: flex-start; /* Links ausrichten */
  width: 100%; /* Volle Breite */
}

.txtField {
  min-width: 100px; /* Mindestbreite */
  max-width: 100%; /* Verhindert, dass das Feld größer als der Container wird */
}

</style>