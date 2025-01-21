<template>

  <div class="text-center ma-2">

    <v-snackbar
        v-model="snackbar"
        location="top"
        color="error"
        timeout="5000"

    >
      {{ snackbarText }}

      <template v-slot:actions >
        <v-btn
            color="black"
            variant="text"
            @click="snackbar = false"
            style="background-color: white; text-transform: none;"

        >
          Schließen
        </v-btn>
      </template>
    </v-snackbar>
  </div>

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
        <div class="text-subtitle-1 text-medium-emphasis mb-6">
          Login
        </div>
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
              @keyup.enter="login()"
          ></v-text-field>

        </div>

        <div>
          <v-card-text class="text-center">
            <router-link
                class="text-blue text-decoration-none"
                :to="{ name: 'reset-password-request' }"
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
            @keyup.enter="login()"
        >
          Login
        </v-btn>

        <div class="hinweisTag">
          <a class="text-red-accent-3 text-center"

          >
            {{hinweisText}}
          </a>
        </div>


        <v-card-text class="text-center">
<!--          <router-link-->
<!--              class="text-blue text-decoration-none"-->
<!--              :to="{ name: 'register' }"-->
<!--          >-->
<!--            Jetzt registrieren <v-icon icon="mdi-chevron-right"></v-icon>-->
<!--          </router-link>-->
        </v-card-text>
      </v-card>

    </div>
  </v-form>
</template>

<script setup>
import { ref } from 'vue';
import AuthenticationService from "@/services/AuthenticationService.js";
import router from "@/router/index.js";
import { useStore } from "vuex";

const store = useStore();
const snackbar = ref(false);
const snackbarText = ref(`Email oder Passwort ist falsch!`);

const visible = ref(false);
const txtPasswort = ref('');
const txtEmail = ref('');
const formNames = ref(null);
const valid = ref(false);
const passwortRules = [(v) => !!v || 'Passwort ist erforderlich'];
const emailRules = [(v) => !!v || 'Email ist erforderlich'];
const isLoading = ref(false);
const hinweisText = ref('');


async function login(){
  localStorage.clear();
  isLoading.value = true;
  hinweisText.value = '';
  if(txtPasswort.value.length === 0) {
    isLoading.value = false;
    return;
  }
  if(txtEmail.value.length === 0) {
    isLoading.value = false;
    return;
  }
  try {
//infasdfo@maaasdfasdrc79.de
// Hallo-2024!
    const response = await AuthenticationService.login(
        {
          email: txtEmail.value,
          password: txtPasswort.value
        }
    )
    //Speichern der des accessToken und des refreshToken
    await store.dispatch('setAccessToken', response.data.accessToken);
    // localStorage.setItem('accessToken', response.data.accessToken);
    // localStorage.setItem('refreshToken', response.data.refreshToken);

    //Speichern der Benutzerdaten im Vuex-Store
    await store.dispatch('login', response.data.userResponse);

    //Die von Backend erhaltenen User-Daten in den localStorage schreiben
    // for (const user in response.data.userResponse) {
    //   if (response.data.userResponse.hasOwnProperty(user)) {
    //     console.log('for user:', user, response.data.userResponse[user]);
    //     localStorage.setItem(user, response.data.userResponse[user]);
    //   }
    // }

    //Benutzerdaten werden anstelle im localStorage jetzt im vuex-Store gespeichert
    await store.dispatch('setUserData', response.data.userResponse);
    console.log('getUserData', await store.getters.getUserData);
    console.log('userData', response.data)

    console.log('localStorage', localStorage)

    console.log('accessToken', response.data.accessToken);
    console.log('refreshToken', response.data.refreshToken);
    console.log('user', response.data.userResponse.nachname);

    isLoading.value = false;

    if(response.data === "authentication accepted")
    {
      console.log("authentication accepted");
    }

    console.log('response',response)

    await router.push('/dashboard');


  } catch(err)
  {
    isLoading.value = false;
    snackbar.value = true;
    //hinweisText.value = 'Email oder Passwort ist falsch!'
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

.hinweisTag {
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>