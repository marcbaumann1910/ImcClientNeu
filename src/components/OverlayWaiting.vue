<script setup>
import {computed, ref} from 'vue'
import store from "@/store/store.js";
//Über den Store kann ein progress Circle veranlasst werden.
//Im Store muss percent als true und in percentValue der entsprechende Wert übergeben werden
const percent = computed(()=> store.getters.getProgressWaiting.percent)
const percentValue = computed(()=> store.getters.getProgressWaiting.percentValue)



</script>

<template>
    <v-overlay :model-value="true" absolute class="loading-overlay">
      <v-progress-circular
          v-if="percent"
          :model-value="percentValue"
          :rotate="180"
          :size="120"
          :width="15"
          color="pink"
      >
        {{ percentValue }}
      </v-progress-circular>

      <v-progress-circular
          v-else
          indeterminate
          color="primary"
          size="64"
      ></v-progress-circular>

    </v-overlay>
</template>

<style scoped>

.loading-overlay {
  position: fixed; /* Fixiert das Overlay relativ zum Viewport */
  top: 0;
  left: 0;
  width: 100vw; /* Gesamte Breite des Viewports */
  height: 100vh; /* Gesamte Höhe des Viewports */
  background-color: rgba(255, 255, 255, 0.7); /* Optional: Halbtransparenter Hintergrund */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Hoher z-index, um über allen Elementen zu liegen */
}


</style>