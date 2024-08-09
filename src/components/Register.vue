<template>
  <div class="register">
    <h1>Register</h1>
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
    <button @click="register">Register</button>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import {watch, onMounted} from 'vue';
import AuthenticationService from "@/services/AuthenticationService.js";

const email = ref('');
const password = ref('');

async function register() {
  try {
    const response = await AuthenticationService.register({
      email: email.value,
      password: password.value,
    });
    console.log('response', response.data);
    console.log(email.value, password.value);

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
