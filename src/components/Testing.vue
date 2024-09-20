<template>
  <div class="register">
    <h1>Testing</h1>

    <v-card
        align="center"
        class="bg-grey-lighten-2"
        justify="center"
        style="height: 50px"
        v-touch="{
        left: () => swipe('Left'),
        right: () => swipe('Right'),
        up: () => swipe('Up'),
        down: () => swipe('Down')
    }"
    >
      <v-card-text class="text-center">
        <div class="text-subtitle-2">Swipe Direction</div>
        {{ swipeDirection }}
      </v-card-text>
    </v-card>

    <br>

    <v-row align="center" justify="center" style="height: 10vh">
      <v-col>
        <v-btn width="100%" class="vBtnTest d-flex justify-space-between align-center" @click="detectSide($event)">
          <!-- Linker Bereich: Plus-Symbol -->
          <v-icon>mdi-plus</v-icon>

          <!-- Mittlerer Bereich: Text, zentriert -->
          <span style="flex-grow: 1; text-align: center;">Text in der Mitte</span>

          <!-- Rechter Bereich: Minus-Symbol -->
          <v-icon>mdi-minus</v-icon>
        </v-btn>
        <p>Du hast auf die {{ side }} Seite des Buttons geklickt.</p>
      </v-col>
    </v-row>

    <br>

    <div class="d-flex align-center flex-column bg-grey-lighten-4 pa-6">
      <v-btn-toggle
          v-model="toggle"
          divided
      >
        <v-btn icon="mdi-plus"></v-btn>
        <v-btn> <span>Klick mich</span></v-btn>
        <v-btn icon="mdi-minus"></v-btn>
      </v-btn-toggle>
    </div>

    <br>

    <div class="d-flex align-center flex-column bg-grey-lighten-4 pa-6">
      <v-btn-toggle
          class="toggleButton"
          v-model="toggle"
          divided
      >
        <!-- Linker Bereich: Plus-Symbol -->
        <v-btn>
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <!-- Mittlerer Bereich: Text, zentriert -->
        <v-btn>
          <span>Text in der Mitte</span>
        </v-btn>

        <!-- Rechter Bereich: Minus-Symbol -->
        <v-btn>
          <v-icon>mdi-minus</v-icon>
        </v-btn>
      </v-btn-toggle>
      <p>Du hast auf die {{ toggle }} Seite des Buttons geklickt.</p>
    </div>

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
    <v-btn class="mb-6" href="/flextest">
      Goto Flex-Test
    </v-btn>

    <br>
    <br>
    <v-btn class="mb-6" @click="token">
      Token V1
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
const swipeDirection = ref('wisch mich')
const side = ref('');
const toggle = ref('');





function  swipe(direction) {
    swipeDirection.value = direction
    if(swipeDirection.value === 'Left')
    {
      swipeDirection.value = "Nach links gewischt"
    }
    else if (swipeDirection.value === 'Right'){
      swipeDirection.value = "Nach rechts gewischt"
    }
}

function detectSide(event) {
  const clickPosition = ref(event.clientX);
  const buttonRect = event.currentTarget.getBoundingClientRect(); // Ermittelt die Position und Breite des Buttons

  // Prüfen, ob der Klick auf der linken oder rechten Seite war
  if (clickPosition.value < buttonRect.left + buttonRect.width / 2) {
    side.value = `linke`;
  } else {
    side.value = `rechte`;
  }

}

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

.vBtnTest {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggleButton{
  min-width: 100%;
}


</style>
