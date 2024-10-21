<template>
  <!-- Snackbar -->
  <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      top
      right
  >
    {{ snackbar.text }}
    <template v-slot:action="{ attrs }">
      <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="snackbar.show = false"
      >
        Schließen
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { reactive, provide } from 'vue';

const snackbar = reactive({
  show: false,
  text: '',
  color: '',
  timeout: 3000, // Standard-Timeout in Millisekunden
});

function showSnackbar({text, color, timeout}) {
  snackbar.text = text;
  snackbar.color = color || '';
  snackbar.timeout = timeout || 3000;
  snackbar.show = true;
}

// Die Funktion 'showSnackbar' bereitstellen
provide('showSnackbar', showSnackbar);
</script>

<style scoped>
/* Optional: Fügen Sie hier Ihre Styles hinzu */
</style>
