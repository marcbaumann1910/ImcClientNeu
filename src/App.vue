<template>
  <v-app> <!-- Dies ist der Hauptcontainer von Vuetify -->
    <!-- AppBar wird immer oben angezeigt -->
    <AppBar />

    <!-- Hauptinhalt der Seite (wird durch die Route geändert) -->
    <v-main>
      <router-view></router-view> <!-- Hier werden die Routeninhalte dargestellt -->
    </v-main>

    <!-- Footer wird immer unten angezeigt -->
    <Footer />
  </v-app>
</template>

<script setup>
import AppBar from './components/AppBar.vue';
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
