<script setup>
import store from '../store/store.js';
import {computed, onMounted} from "vue";
const imageUrl = process.env.VITE_API_URL
const cartItems = computed(()=>store.getters.getCartItems);

</script>

<template>
  <v-container>

    <v-list dense class="d-flex flex-wrap flex-column">
      <v-row>
        <v-col>
          <v-list-item-action class="ml-4">
            <v-list-item-title>Artikel</v-list-item-title>
          </v-list-item-action>
        </v-col>

        <v-list-item-action class="mr-7">
          <v-list-item-title>Preis</v-list-item-title>
        </v-list-item-action>


      </v-row>
      <v-divider></v-divider>
      <v-list-item v-for="(item, index) in cartItems" :key="index">
        <v-row no-gutters align="start" class="w-100">
          <v-col cols="1" class="d-flex align-center" > <!-- Flexibel halten und rechten Abstand hinzufügen -->
            <v-img
              :src="`${imageUrl}${item.Bildpfad}`"
              alt="Artikelbild"
              min-height="50"
              min-width="50"
              max-width="70"
              max-height="70"
              class="mt-2"
          ></v-img>
          </v-col>

          <v-col cols="2" class="mb-2">
            <v-list-item-title>{{ item.ArtikelBezeichnung }}</v-list-item-title>
            <v-list-item-subtitle>Farbe: {{ item.Farbe }} </v-list-item-subtitle>
            <v-list-item-subtitle>Einzelreis: {{ item.Preis }} €</v-list-item-subtitle>
            <v-list-item-subtitle>Größe: {{ item.Konfektionsgroesse }}</v-list-item-subtitle>
            <v-list-item-subtitle>Menge: {{ item.Menge }} Stück</v-list-item-subtitle>
          </v-col>

          <v-col cols="4" class="d-flex flex-column justify-end align-center align-self-stretch">
            <v-list-item-title>Anzahl ändern</v-list-item-title>
          </v-col>

          <v-col cols="4" class="d-flex flex-column justify-end align-center align-self-stretch">
            <v-list-item-title>löschen</v-list-item-title>
          </v-col>

          <v-col cols="1" class="d-flex justify-end align-end">
            <v-list-item-title>{{ Math.round(((item.Preis * item.Menge) *100) /100).toFixed(2) }} €</v-list-item-title>
          </v-col>

          <v-divider></v-divider>

        </v-row>
      </v-list-item>

      <v-row>
        <v-col class="d-flex justify-end mr-0">
        <v-list-item-action class="mr-2">
          <v-list-item-title><b>Gesamtpreis: xx,xx €</b></v-list-item-title>
        </v-list-item-action>
        </v-col>

      </v-row>

    </v-list>

  </v-container>
</template>

<style scoped>

</style>
