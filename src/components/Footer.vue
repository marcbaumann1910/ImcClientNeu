<template>
  <v-footer class="bg-red lighten-3" app>
    <v-row justify="center" no-gutters>
      <v-btn
          v-for="link in links"
          :key="link"
          class="mx-2"
          color="white"
          rounded="xl"
          variant="text"
      >
        {{ link }}
      </v-btn>
      <v-col class="text-center mt-4" cols="12">
        {{ new Date().getFullYear() }} — <strong>Marc Baumann</strong>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script setup>
import { ref } from 'vue'
const links = ref(['Home', 'Über uns', 'Team', 'Services', 'Impressum']);

</script>

<style scoped>
/* Stile für die Register-Komponente */
</style>
