<template>
  <div class="register">
    <h1>Register</h1>
    <input
        type="text"
        placeholder="Verein"
        v-model="verein"
    />
    <br>
    <br>
    <input
        type="text"
        placeholder="Vorname"
        v-model="vorname"
    />
    <br>
    <br>
    <input
        type="text"
        placeholder="Nachname"
        v-model="nachname"
    />
    <br>
    <br>
    <input
        type="email"
        placeholder="Email"
        v-model="email"
    />
    <br>
    <br>
    <input
        type="password"
        placeholder="Passwort"
        v-model="password"
    />
    <br>
    <br>
    <input
      type="password"
      placeholder="Password confirmation"
      v-model="passwordConfirmation"
    />
    <br>
    <br>
    <input
        type="text"
        placeholder="ID-Benutzer"
        v-model="id"
    />
    <br>
    <br>
    <button @click="register">Register</button>
    <br>
    <button @click="autofill">AutoFill</button>
    <br>
    <a >
      {{ errorMessage }}
    </a>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import AuthenticationService from "@/services/AuthenticationService.js";

const verein = ref('');
const vorname = ref('');
const nachname = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const id = ref('');
const errorMessage = ref('');

async function register() {

  if(verein.value.length === 0)
  {
    console.log('Verein is missing');
    errorMessage.value = 'Verein is missing';
    return;
  }

  if(vorname.value.length === 0)
  {
    console.log('Vorname is missing');
    errorMessage.value = 'Vorname is missing';
    return;
  }

  if(nachname.value.length === 0)
  {
    console.log('Nachname is missing');
    errorMessage.value = 'Nachname is missing';
    return;
  }

  if(email.value.length === 0)
  {
    console.log('Email is missing');
    errorMessage.value = 'Email is missing';
    return;
  }

  if(password.value.length === 0 || passwordConfirmation.value.length === 0)
  {
    console.log('password or passwort Confirmation is empty');
    errorMessage.value = ref('password or passwort Confirmation is empty')
    return;
  }
  if(password.value !== passwordConfirmation.value)
  {
    console.log('password Confirmation is not correct');
    errorMessage.value = 'password Confirmation is not correct';
    return;
  }

  errorMessage.value = ref('');

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

  }catch (err) {
    //console.log('CatchBlock in Register.vue', err); //Gibt das komplette Error-Objekt zurück
    console.log('err.response.data: ', err.response.data);
    //Field kommt vom Backend und wird von mir erzeugt und zurückgegeben
    //Auf die Bezeichnung des Feldes kann somit zugegriffen werden, bei Bedarf
    console.log('err.response.data.field: ', err.response.data.field);
      if(err.response)
      {
        console.log(err.response.data.error);
        errorMessage.value = err.response.data.error;
      }
      else {
        console.log('Ein unbekannter Fehler ist aufgetreten', err.message)
      }
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
