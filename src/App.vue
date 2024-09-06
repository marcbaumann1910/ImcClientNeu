<template>
  <v-app> <!-- Dies ist der Hauptcontainer von Vuetify -->
    <!-- AppBar wird immer oben angezeigt -->
<!--    <AppBar />-->
    <Navigation4 />
<!--    <SideBarLeft />-->

    <!-- Hauptinhalt der Seite (wird durch die Route geändert) -->
    <v-main class="fill-height">
      <v-container>
        <!-- Hier wird der gerenderte Inhalt deiner Routen angezeigt -->
        <router-view></router-view>
      </v-container>
    </v-main>
    <!-- Footer wird immer unten angezeigt -->
    <Footer />
    </v-app>
</template>

<script setup>
import AppBar from './components/AppBar.vue';
import Footer from './components/Footer.vue'; // Importiere den Footer
import SideBarLeft from './components/SideBarLeft.vue';
import Navigation from './components/_Navigation.vue';
import Navigation2 from './components/_Navigation2.vue';
import Navigation3 from './components/_Navigation3.vue';
import Navigation4 from './components/Navigation4.vue';
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

/* FOOTER Einstellungen*/
.fill-height {
  min-height: calc(100vh - 64px - 100px); /* Berechne die verfügbare Höhe */
}
</style>
