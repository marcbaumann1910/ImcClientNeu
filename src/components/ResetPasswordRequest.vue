<script setup>
import AuthenticationService from "@/services/AuthenticationService.js";
import { ref } from 'vue';
const emailRules = [(v) => !!v || 'Email ist erforderlich'];
const txtEmail = ref('');
const valid = ref(false);
const visible = ref(false);
const isLoading = ref(false);
const formNames = ref(null);
const snackbar = ref(false);
const snackbarText = ref('')
const snackbarColor = ref('error')

async function resetPassword() {

  if (txtEmail.value === '' || txtEmail.value.length === 0) {
      snackbarText.value = 'Email-Adresse muss angegeben werden';
      snackbarColor.value = "error"
      snackbar.value = true;
      console.log('im if block')
      return;
  }

  try{
    const response = await AuthenticationService.resetPasswordRequest({
      email: txtEmail.value
    })

    console.log('response in try',response);

  }catch (err){
  }
    snackbarText.value = 'Wenn die angegebene E-Mail-Adresse in unserem System vorhanden ist,\nhaben wir Ihnen eine E-Mail mit weiteren Anweisungen zum Zurücksetzen des Passworts gesendet.';
    snackbarColor.value = "success"
    snackbar.value = true;

}
</script>

<template>
<v-app>
  <v-snackbar
      v-model="snackbar"
      multi-line
      location="top"
      timeout="10000"
      :color="snackbarColor"
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

  <v-form ref="formNames" v-model="valid" lazy-validation>
   <v-card class="mx-auto pa-12 pb-8 mt-16"
           elevation="8"
           max-width="600"
           rounded="lg"
   >
    <v-card-title>Passwort zurücksetzen</v-card-title>
    <v-card-text>
      Bitte Emailadresse angeben
    </v-card-text>

     <v-text-field
         class="txtField"
         v-model="txtEmail"
         density="compact"
         placeholder="Email-Adresse"
         prepend-inner-icon="mdi-email-outline"
         :rules="emailRules"
         variant="filled"
     ></v-text-field>

     <v-btn
         @click="resetPassword()"
         class="mb-8 mt-4"
         color="primary"
         size="large"
         block
         :loading="isLoading"
     >
       Passwort zurücksetzen
     </v-btn>

  </v-card>
    </v-form>
</v-app>/


</template>

<style scoped>

</style>