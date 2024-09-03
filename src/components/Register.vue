<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
    <v-card class="pa-4">
      <v-toolbar flat dark style="background: linear-gradient(to right, #B71C1C, #D32F2F); color: white; font-weight: bold;">
<!--      <v-btn icon>-->
<!--        <v-icon>mdi-arrow-left</v-icon>-->
<!--      </v-btn>-->
      <v-card-title class="text-h6 font-weight-regular"> Registrieren </v-card-title>
      <v-spacer></v-spacer>
<!--      <v-btn icon>-->
<!--        <v-icon>mdi-magnify</v-icon>-->
<!--      </v-btn>-->
<!--      <v-btn icon>-->
<!--        <v-icon>mdi-dots-vertical</v-icon>-->
<!--      </v-btn>-->
    </v-toolbar>
    <v-form ref="form" class="pa-4 pt-6">
      <v-text-field
          v-model="verein"
          :rules="rules.required"
          color="deep-purple"
          label="Verein"
          variant="filled"
      ></v-text-field>
      <v-text-field
          v-model="vorname"
          :rules="rules.required"
          color="deep-purple"
          label="Vorname"
          variant="filled"
      ></v-text-field>
      <v-text-field
          v-model="nachname"
          :rules="rules.required"
          color="deep-purple"
          label="Nachname"
          variant="filled"
      ></v-text-field>
      <v-text-field
          v-model="email"
          :rules="rules.email"
          color="deep-purple"
          label="Email Adresse"
          type="email"
          variant="filled"
      ></v-text-field>
      <v-text-field
          v-model="password"
          :rules="[...rules.password, ...rules.length(8)]"
          color="deep-purple"
          label="Password"
          style="min-height: 96px"
          type="password"
          variant="filled"
      >
        <template v-slot:counter>
    <span :class="{ 'error--text': password.length < 8 }">
      {{ password.length }}/8
    </span>
        </template>
      </v-text-field>
      <v-text-field
          v-model="passwordConfirmation"
          :rules="[...rules.password, ...rules.length(8), ...rules.matchPassword]"
          color="deep-purple"
          label="Password wiederholen"
          style="min-height: 96px"
          type="password"
          variant="filled"
      >
        <template v-slot:counter>
    <span :class="{ 'error--text': passwordConfirmation.length < 8 }">
      {{ passwordConfirmation.length }}/8
    </span>
        </template>
      </v-text-field>

      <v-textarea
          v-model="bio"
          color="deep-purple"
          label="Bio"
          rows="1"
          variant="filled"
          auto-grow
      ></v-textarea>
      <v-checkbox
          v-model="agreement"
          :rules="rules.required"
          color="deep-purple"
      >
        <template v-slot:label>
          I agree to the&nbsp;
          <a href="#" @click.stop.prevent="dialog = true">Terms of Service</a>
          &nbsp;and&nbsp;
          <a href="#" @click.stop.prevent="dialog = true">Privacy Policy</a>*
        </template>
      </v-checkbox>
    </v-form>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn variant="text" @click="form.reset()"> zurücksetzen </v-btn>
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="autofill()"> Autofill </v-btn>
      <v-spacer></v-spacer>
      <v-btn
          :loading="isLoading"
          color="deep-purple-accent-4"
          @click="register"
      >
        Registrieren
      </v-btn>
    </v-card-actions>
    <v-dialog v-model="dialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-grey-lighten-3"> Legal </v-card-title>
        <v-card-text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn variant="text" @click="agreement = false, dialog = false">
            No
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
              color="deep-purple"
              variant="tonal"
              @click="agreement = true, dialog = false"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

      <!-- Hinweis wenn Email bereits existiert-->
      <v-dialog v-model="emailExistsDialog" max-width="400" persistent>
        <v-card>
          <v-card-title class="text-h5">Account bereits vorhanden</v-card-title>
          <v-card-text>
            Diese E-Mail-Adresse ist bereits registriert. Möchten Sie sich stattdessen einloggen?
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="redirectToLogin">Einloggen</v-btn>
            <v-btn color="secondary" text @click="emailExistsDialog = false">Schließen</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

  </v-card>
    </v-col>
  </v-row>
</v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import AuthenticationService from "@/services/AuthenticationService.js";

const agreement = ref(false);
const bio = ref('Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts');
const dialog = ref(false);
const isLoading = ref(false);
const phone = ref(undefined);
const emailExistsDialog = ref(false);

// Rules as a reactive object
const rules = {
  email: [
    (v) => (!!v && /@/.test(v)) || 'Bitte eine gültige Emailadresse angeben',
  ],
  length: (len) => [
    (v) => (!!v && v.length >= len) || `Ungültige Passwortlänge, erforderlich sind ${len} Zeichen`,
  ],
  password: [
    (v) => (!!v && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/.test(v)) ||
        'Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.',
  ],
  required: [
    (v) => !!v || 'Dieses Feld ist erforderlich',
  ],
  matchPassword: [
    (v) => v === password.value || 'Passwörter stimmen nicht überein',
  ],
};





const verein = ref('');
const vorname = ref('');
const nachname = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const id = ref('');
const errorMessageAusgabe = ref('');


async function register() {
  isLoading.value = true;

  if(verein.value.length === 0)
  {
    console.log('Verein is missing');
    errorMessageAusgabe.value = 'Verein is missing';
    isLoading.value = false;
    return;
  }

  if(vorname.value.length === 0)
  {
    console.log('Vorname is missing');
    errorMessageAusgabe.value = 'Vorname is missing';
    isLoading.value = false;
    return;
  }

  if(nachname.value.length === 0)
  {
    console.log('Nachname is missing');
    errorMessageAusgabe.value = 'Nachname is missing';
    isLoading.value = false;
    return;
  }

  if(email.value.length === 0)
  {
    console.log('Email is missing');
    errorMessageAusgabe.value = 'Email is missing';
    isLoading.value = false;
    return;
  }

  if(password.value.length === 0 || passwordConfirmation.value.length === 0)
  {
    console.log('password or passwort Confirmation is empty');
    errorMessageAusgabe.value = ref('password or passwort Confirmation is empty')
    isLoading.value = false;
    return;
  }
  if(password.value !== passwordConfirmation.value)
  {
    console.log('password Confirmation is not correct');
    errorMessageAusgabe.value = 'password Confirmation is not correct';
    isLoading.value = false;
    return;
  }

  errorMessageAusgabe.value = ref('');

  try {
    const response = await AuthenticationService.register({
      vorname: vorname.value,
      nachname: nachname.value,
      verein: verein.value,
      email: email.value,
      password: password.value
    });
    console.log('response', response.data);
    console.log(email.value, password.value);
    console.log('Neue ID: ', response.data.insertId)
    console.log(response.data.insertId);
    console.log('response.data.message', response.data.message);

    if(response.data === 'Emailadresse existiert bereits')
    {
      emailExistsDialog.value = true
    }

    if(!response.data.insertId)
    {
      errorMessageAusgabe.value = 'Keine neue ID generiert!';
    }
    else {
      errorMessageAusgabe.value = 'NeueID: ' +  response.data.insertId;
    }
    isLoading.value = false;

  }catch (err) {
    //console.log('CatchBlock in Register.vue', err); //Gibt das komplette Error-Objekt zurück
    console.log('err.response.data: ', err.response.data);
    //Field kommt vom Backend und wird von mir erzeugt und zurückgegeben
    //Auf die Bezeichnung des Feldes kann somit zugegriffen werden, bei Bedarf
    console.log('err.response.data.field: ', err.response.data.field);
      if(err.response)
      {
        console.log(err.response.data.error);
        errorMessageAusgabe.value = err.response.data.error;

      }
      else {
        console.log('Ein unbekannter Fehler ist aufgetreten', err.message)
      }
    isLoading.value = false;
    }

}

async function autofill() {
  vorname.value = 'Marc';
  nachname.value = 'Baumann';
  verein.value = 'Willstätter Hexen 1958 e.V.';
  email.value = 'info@marc79.de';
  password.value = 'Hallo-2024!';
  passwordConfirmation.value = 'Hallo-2024!';
}

watch(vorname, (newVal, oldVal) => {
  console.log(newVal);
})

//onMounted();

</script>

<style scoped>

/* Stile für die Register-Komponente */
input {
  margin-left: 10px;
}

button {
  margin-left: 10px;
}
a {
  margin-left: 10px;
  font-style: italic;
  font-size: 12px;
  color: red;

}
</style>
