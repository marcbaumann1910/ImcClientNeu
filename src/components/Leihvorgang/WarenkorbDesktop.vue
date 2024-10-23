<script setup>
import { ref, computed, watch } from 'vue';
import store from '../../store/store.js';
import Leihvorgang from "@/components/Leihvorgang/Leihvorgang.vue";

const imageUrl = process.env.VITE_API_URL

//Überwacht den vuex-Store und aktualisiert den Warenkorb
const cartItems = computed(() => store.getters.getCartItems);

console.log('cartItems warenkorb', cartItems);

function closeCart(){
    store.dispatch('setShowWarenkorbDesktop', false)
}

function deleteItemFromCart(id, itemCount){
    store.dispatch('deleteItemFromCart', id); //löschen des Artikels aus vuex-Store
    store.dispatch('setCartItemCount', store.getters.getCartItemCount - itemCount) //Anpassen der Anzeige Artikel im Warenkorb
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
                @click="deleteItemFromCart(item.IDInventarArtikel, item.Menge)"
                role="button"
                class="clickable-avatar mr-4"
            ></v-avatar>
          </v-row>
      </v-list-item>
      <!-- $emit übergibt an Leihvorgang true, damit Leihvorgang die Navigation auf die Checkoutseite durchführt-->
      <!-- ToDo: Erstmal deaktiviert, da dieser Button auch den Vorgang bucht, wenn man sich auf der letzten Seite befinden     -->
<!--      <v-btn-->
<!--          class="ma-2 "-->
<!--          color="primary"-->
<!--          v-if="cartItems.length > 0"-->
<!--          @click="$emit('goToCheckout', true)"-->
<!--      >zur Übersicht-->
<!--      </v-btn>-->
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
