<script setup>
import AuthenticationService from "@/services/AuthenticationService.js";
import { ref } from 'vue';
import { useRoute } from 'vue-router'
const route = useRoute();
import router from "@/router/index.js";
const passwortRules = [(v) => !!v || 'Passwort ist erforderlich'];
const txtPasswort = ref('');
const txtPasswortRepaet = ref('')
const valid = ref(false);
const visible = ref(false);
const isLoading = ref(false);
import { notifyError, notifySuccess } from '@/scripte/notifications.js';
import Notifications from "@/components/Notifications.vue";


const rules = {
    password: [
    (v) => (!!v && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/.test(v)) ||
        'Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben,\neine Zahl sowie ein Sonderzeichen enthalte und mindestens 8 Zeichen',
    ],
  length: (len) => [
    (v) => (!!v && v.length >= len) || `Ungültige Passwortlänge, erforderlich sind ${len} Zeichen`,
  ]};



async function resetPassword() {

  //holt den Token aus der URL
  const token = route.query.token;

  if(!token)
  {
    notifyError('Passwort kann nicht geändert werden!');
    return;
  }

  if(txtPasswort.value === '' || txtPasswortRepaet.value === '') {
    notifyError('Es muss ein Passwort angegeben werden!');
    return;
  }

  if (txtPasswort.value !== txtPasswortRepaet.value) {
    notifyError('Passwörter stimmen nicht überein');
    return;
  }

  try{
    const response = await AuthenticationService.resetPassword({
      newPassword: txtPasswort.value,
      token: token,
    })

    console.log('response in try',response);

    if(response.status !== 200){
      if(response.data.message === ''){
        notifyError('Passwort konnte nicht geändert werden');
      }
    }

    if(response.status === 200){
      notifySuccess('Passwort wurde erfolgreich geändert\nSie werden weitergeleitet');
      //sleep
      await new Promise(resolve => setTimeout(resolve, 3000));
      router.push('/login');
    }

  }catch(err){
    notifyError('Passwort konnte nicht geändert werden');
    console.log(err);
  }

}
</script>

<template>
<v-app>

  <Notifications/>

  <v-form ref="formNames" v-model="valid" lazy-validation>
   <v-card class="mx-auto pa-12 pb-8 mt-16"
           elevation="8"
           max-width="600"
           rounded="lg"
   >
    <v-card-title>Neues Passwort festlegen</v-card-title>
    <v-card-text>
      Bitte Passwort angeben
    </v-card-text>

    <v-text-field
        class="txtField mb-5"
        v-model="txtPasswort"
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="compact"
        placeholder="Passwort"
        prepend-inner-icon="mdi-lock-outline"
        variant="filled"
        :rules="[...rules.password, ...rules.length(8)]"
        @click:append-inner="visible = !visible"
    >
    </v-text-field>

     <v-text-field
         class="txtField"
         v-model="txtPasswortRepaet"
         :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
         :type="visible ? 'text' : 'password'"
         density="compact"
         placeholder="Passwort wiederholen"
         prepend-inner-icon="mdi-lock-outline"
         variant="filled"
         :rules="passwortRules"
         @click:append-inner="visible = !visible"
     >
     </v-text-field>

     <v-btn
         @click="resetPassword()"
         class="mb-8 mt-4"
         color="primary"
         size="large"
         block
         :loading="isLoading"
     >
       Passwort ändern
     </v-btn>

  </v-card>
    </v-form>
</v-app>/


</template>

<style scoped>

</style>