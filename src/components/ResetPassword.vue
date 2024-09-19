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
const snackbar = ref(false);
const snackbarText = ref('')
const snackbarColor = ref('error')


async function resetPassword() {

  //holt den Token aus der URL
  const token = route.query.token;


  if(!token)
  {
    snackbarText.value = 'Passwort kann nicht geändert werden!'
    snackbar.value = true;
    return;
  }

  if(txtPasswort.value === '' || txtPasswortRepaet.value === '') {
    snackbarText.value = 'Es muss ein Passwort angegeben werden!';
    snackbar.value = true;
    return;
  }

  if (txtPasswort.value !== txtPasswortRepaet.value) {
    snackbarText.value = 'Passwörter stimmen nicht überein';
    snackbar.value = true;
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
        snackbarText.value = 'Passwort wurde erfolgreich geändert\nSie werden weitergeleitet';
        snackbarColor.value = "error"
        snackbar.value = true;
      }
    }

    if(response.status === 200){
      snackbarText.value = 'Passwort wurde erfolgreich geändert\nSie werden weitergeleitet';
      snackbarColor.value = "success"
      snackbar.value = true;
      //sleep
      await new Promise(resolve => setTimeout(resolve, 3000));
      router.push('/login');
    }

  }catch(err){
    snackbarText.value = 'Passwort konnte nicht geändert werden';
    snackbarColor.value = "error"
    snackbar.value = true;
    console.log(err);
  }

}
</script>

<template>
<v-app>

  <v-snackbar
      v-model="snackbar"
      multi-line
      location="top"
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
    <v-card-title>Neues Passwort festlegen</v-card-title>
    <v-card-text>
      Bitte Passwort angeben
    </v-card-text>

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