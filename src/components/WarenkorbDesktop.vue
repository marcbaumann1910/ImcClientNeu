<script setup>
import { ref, computed, watch } from 'vue';
import store from '../store/store.js';

const imageUrl = process.env.VITE_API_URL
const IDInventarArtikel = ref(0);

//Überwacht den vuex-Store und aktualisiert den Warenkorb
const cartItems = computed(() => store.getters.getCartItems);

console.log('cartItems warenkorb', cartItems);

function closeCart(){
    store.dispatch('setShowWarenkorbDesktop', false)
}

function deleteItemFromCart(id){
    store.dispatch('deleteItemFromCart', id);
}


</script>

<template>
  <!-- Rechte Sidebar (Warenkorb) -->
  <v-navigation-drawer
      location="right"
      permanent
      width="300"
      class="elevation-1"
  >
    <v-toolbar flat color="primary">
      <v-toolbar-title>Warenkorb</v-toolbar-title>
       <v-btn @click="closeCart">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar> <!-- Inhalt des Warenkorbs -->
    <v-divider></v-divider>

    <v-list dense class="d-flex flex-wrap flex-column">
      <v-list-item v-for="(item, index) in cartItems" :key="index">
          <v-row class="d-flex align-center">
            <!-- Spalte für das Bild -->
            <v-col cols="auto" class="mr-3"> <!-- Flexibel halten und rechten Abstand hinzufügen -->
              <v-img
                  :src="`${imageUrl}${item.Bildpfad}`"
                  alt="Artikelbild"
                  min-height="50"
                  min-width="50"
              ></v-img>
            </v-col>

            <!-- Spalte für den Text -->
            <v-col class="text-start">
              <v-list-item-title>{{ item.ArtikelBezeichnung }}</v-list-item-title>
              <v-list-item-subtitle>Farbe: {{ item.Farbe }} </v-list-item-subtitle>
              <v-list-item-subtitle>Preis: {{ item.Preis * item.Menge }} €</v-list-item-subtitle>
              <v-list-item-subtitle>Größe: {{ item.Konfektionsgroesse }}</v-list-item-subtitle>
              <v-list-item-subtitle>Menge: {{ item.Menge }} Stück</v-list-item-subtitle>
            </v-col>

            <v-avatar
                icon="mdi-delete-outline"
                @click="deleteItemFromCart(item.IDInventarArtikel)"
                role="button"
                class="clickable-avatar mr-4"
            ></v-avatar>
          </v-row>


      </v-list-item>
    </v-list>


  </v-navigation-drawer>
</template>

<style scoped>
.clickable-avatar {
  cursor: pointer;           /* Zeigt eine Hand an, wie bei einem Button */
  transition: transform 0.2s ease; /* Optional: fügt eine kleine Animation hinzu */
}

.clickable-avatar:focus,
.clickable-avatar:hover {
  transform: scale(1.1);     /* Optional: Vergrößerung bei Fokus/Hover */
}
</style>
