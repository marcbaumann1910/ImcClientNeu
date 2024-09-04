<template>
  <v-layout>
    <!-- App-Bar (Navigation oben) -->
    <v-app-bar color="secondary" prominent app>
      <v-app-bar-nav-icon
          variant="text"
          @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>

      <v-toolbar-title>IMS Willstätter Hexen</v-toolbar-title>

      <v-spacer></v-spacer>

      <template v-if="$vuetify.display.mdAndUp">
        <v-btn icon="mdi-magnify" variant="text"></v-btn>
        <v-btn icon="mdi-filter" variant="text"></v-btn>
      </template>

      <v-btn icon="mdi-dots-vertical" variant="text"></v-btn>
    </v-app-bar>

    <!-- Navigation Drawer (Seitenleiste) -->
    <v-navigation-drawer
        v-model="drawer"
        :location="$vuetify.display.mobile ? 'bottom' : undefined"
        app
        temporary
    >
      <v-list :items="items"></v-list>
    </v-navigation-drawer>

    <!-- Hauptinhalt mit Router-View -->
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, watch } from "vue";
const drawer = ref(false);
const group = ref(null);

const items = ref([
  { title: 'Dashboard', value: 'dashboard' },
  { title: 'Artikel', value: 'artikel' },
  { title: 'Abrechnung', value: 'abrechnung' },
  { title: 'Registrieren', value: 'registrieren' },
]);

watch(group, (newVal, oldVal) => {
  drawer.value = false;
});
</script>

<style scoped>

</style>
