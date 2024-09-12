<template>
  <div class="register">
    <h1>Testing</h1>
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
        type="text"
        placeholder="ID-Benutzer"
        v-model="id"
    />
    <br>
    <br>
    <button @click="register">Register</button>

    <br>
    <br>
    <input
        type="test"
        placeholder="vorname"
        v-model="vorname"
    />
    <br>
    <br>
    <input
        type="test"
        placeholder="nachname"
        v-model="nachname"
    />

    <br>
    <br>

    <v-btn class="mb-6" @click="token">
      Token
    </v-btn>

    <table>
      <thead>
      <tr>
        <th>ID</th>
        <th>Vorname</th>
        <th>Nachname</th>
        <th>Verein</th>
        <th>Email</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in usersList" :key="user.IDBenutzer">
        <td>{{ user.IDBenutzer }}</td>
        <td>{{ user.Vorname }}</td>
        <td>{{ user.Nachname }}</td>
        <td>{{ user.Verein }}</td>
      </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import {watch, onMounted} from 'vue';
import AuthenticationService from "@/services/AuthenticationService.js";

const email = ref('');
const password = ref('');
const id = ref('');
const vorname = ref('');
const nachname = ref('');
const usersList = ref([]); // Array zum Speichern der Benutzerliste

async function token() {
  try
  {
    const result = await AuthenticationService.testing({
      id: "71"
    });

    console.log('result',result)
  }catch(err)
  {

  }
}

async function register() {
  try {
    const response = await AuthenticationService.testing({
      id: id.value
    });
    const users = response.data;
    console.log('users_: ', users)
    //Gibt die Daten an userList und dies wird in der Tabelle verarbeitet!
    usersList.value = response.data;
    console.log('users_Vorname:', users[0].Vorname);
    console.log('IDBenutzer:', users[0].IDBenutzer)
    console.log('response', response);
    console.log(email.value, password.value);
    vorname.value = users.Vorname;
    nachname.value = users.Verein;
    console.log('testing');

    users.forEach(user => {
      console.log('Verein_forEach:', user.Verein);
      console.log('Vorname_forEach:', user.Vorname);
      console.log('Nachname_forEach:', user.Nachname);
    });

    if (Array.isArray(users)) {
      // Beispiel: Greife auf das erste Element zu
      console.log('Vorname des ersten Benutzers:', users[0].Vorname);

      // Setze die Werte für das erste Benutzerobjekt
      email.value = users[0].Vorname;
      password.value = users[0].Verein;

      // Falls du die Daten in einer Liste darstellen möchtest:
      // Benutzerliste durchlaufen und etwas tun
      users.forEach(user => {
        console.log('Verein:', user.Verein);
        console.log('Vorname:', user.Vorname);
        console.log('Nachname:', user.Nachname);
      });


    } else {
      console.log('response.data ist kein Array');
    }



  }catch (err) {
    console.log(err);
  }
}

</script>

<style scoped>
/* Stile für die Register-Komponente */
input {
  margin-left: 10px;
}

button {
  margin-left: 10px;
}
</style>
