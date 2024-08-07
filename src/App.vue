<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <br>
      <router-link to="/register">Register</router-link>
    </nav>
    <Header /> <!-- Header wird hier eingebunden -->

    <router-view></router-view> <!-- Hier werden die Routeninhalte dargestellt -->

    <Footer /> <!-- Footer wird hier eingebunden -->
  </div>
</template>

<script setup>
import Header from './components/Header.vue'; // Importiere den Header
import Footer from './components/Footer.vue'; // Importiere den Footer



</script>

<style>
body {
  margin: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#app {
  flex: 1;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
