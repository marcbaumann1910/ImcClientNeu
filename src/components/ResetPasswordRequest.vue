<script setup>
import AuthenticationService from "@/services/AuthenticationService.js";
import { ref } from 'vue';
const emailRules = [(v) => !!v || 'Email ist erforderlich'];
const txtEmail = ref('');
const valid = ref(false);
const visible = ref(false);
const isLoading = ref(false);
const formNames = ref(null);
import { notifyError, notifySuccess } from '@/scripte/notifications.js';
import Notifications from "@/components/Notifications.vue"; // Globale Benachrichtigungen

async function resetPassword() {

  if (txtEmail.value === '' || txtEmail.value.length === 0) {
      notifyError('Email-Adresse muss angegeben werden');
      return;
  }

  try{
    const response = await AuthenticationService.resetPasswordRequest({
      email: txtEmail.value
    })

    console.log('response in try',response);

    notifySuccess('Wenn die angegebene E-Mail-Adresse in unserem System vorhanden ist,\nhaben wir Ihnen eine E-Mail mit weiteren Anweisungen zum Zurücksetzen des Passworts gesendet.');

  }catch (err){
  }
    notifySuccess('Wenn die angegebene E-Mail-Adresse in unserem System vorhanden ist,\nhaben wir Ihnen eine E-Mail mit weiteren Anweisungen zum Zurücksetzen des Passworts gesendet.');
}
</script>

<template>
<v-app>
   <Notifications/>

  <v-form ref="formNames" v-model="valid" lazy-validation>

    <v-row>

    <v-card class="mx-auto pa-12 pb-8 mt-16"
           elevation="8"
           max-width="400"
           rounded="lg"
   >
    <v-card-title class="textResponsiveTextField">Passwort zurücksetzen</v-card-title>
    <v-card-text class="textResponsiveTextField" >Bitte Emailadresse angeben</v-card-text>

     <v-text-field
         class="text-tr"
         v-model="txtEmail"
         density="compact"
         placeholder="Email-Adresse"
         prepend-inner-icon="mdi-email-outline"
         :rules="emailRules"
         variant="filled"
     ></v-text-field>

     <v-btn
         @click="resetPassword()"
         class="textResponsiveButton mb-8 mt-4"
         color="primary"
         size="large"
         block
         :loading="isLoading"
     >
       Passwort zurücksetzen
     </v-btn>

     </v-card>

  </v-row>
  </v-form>
</v-app>


</template>

<style scoped>
.viewport-text{
  font-size: 5vw;
}

.textResponsiveButton{
  text-transform: none;
}

@media (max-width: 350px) {
  .textResponsiveTextField {
    font-size: 0.84em;
  }
}

@media (min-width: 200px) {
  .textResponsiveButton {
    font-size: 0.87em;
  }
}

@media (min-width: 350px) {
  .textResponsiveButton {
    font-size: 0.9em;
  }
}

@media (min-width: 600px) {
  .textResponsiveButton {
    font-size: 0.95em;
  }
}

@media (min-width: 960px) {
  .textResponsiveButton {
    font-size: 1em;
  }
}

@media (min-width: 1264px) {
  .textResponsiveButton {
    font-size: 1.1em;
  }
}

</style>