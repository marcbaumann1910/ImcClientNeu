<template>
  <v-layout>
    <!-- App-Bar (immer oben sichtbar) -->
    <v-app-bar color="secondary" prominent app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" variant="text"></v-app-bar-nav-icon>
      <v-toolbar-title>IMS Willstätter Hexen</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-dots-vertical" variant="text"></v-btn>
    </v-app-bar>

    <!-- Navigation Drawer (Sidebar, über den Inhalt gelegt) -->
    <v-navigation-drawer
        v-model="drawer"
        app
        temporary
    >
      <v-list :items="items"></v-list>
    </v-navigation-drawer>

    <!-- Hauptinhalt (wird nicht von der Sidebar verschoben) -->
    <v-main>
      <router-view></router-view> <!-- Routeninhalt wird hier geladen -->
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref } from 'vue';

const drawer = ref(false);
const items = ref([
  { title: 'Dashboard', value: 'dashboard' },
  { title: 'Artikel', value: 'artikel' },
  { title: 'Abrechnung', value: 'abrechnung' },
  { title: 'Registrieren', value: 'registrieren' },
]);
</script>
