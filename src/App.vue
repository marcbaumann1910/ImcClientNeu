<template>
  <v-app> <!-- Dies ist der Hauptcontainer von Vuetify -->
    <!-- AppBar wird immer oben angezeigt -->
<!--    <AppBar />-->
    <Navigation3 />
<!--    <SideBarLeft />-->

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
import SideBarLeft from './components/SideBarLeft.vue';
import Navigation from './components/Navigation.vue';
import Navigation2 from './components/Navigation2.vue';
import Navigation3 from './components/Navigation3.vue';
import Dashboard from "@/components/Dashboard.vue";
import Abrechnung from "@/components/Abrechnung.vue";
import Artikel from "@/components/Artikel.vue";
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
