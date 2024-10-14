<script setup>
import store from '../store/store.js';
import {computed, onMounted} from "vue";

const cartItems = computed(()=>store.getters.getCartItems);

</script>

<template>
<v-container>

  <v-list dense class="d-flex flex-wrap flex-column">
        <v-list-item v-for="(item, index) in cartItems" :key="index">
          <v-row class="d-flex align-start">
            <v-col cols="auto" class="mr-3"> <!-- Flexibel halten und rechten Abstand hinzufügen -->              <v-img
                src="`${imageUrl}${item.Bildpfad}`"
                  alt="Artikelbild"
                  min-height="50"
                  min-width="50"
                  max-width="70"
                  max-height="70"
              ></v-img>
            </v-col>

            <v-col>
              <v-list-item-title>{{item.ArtikelBezeichnung}}</v-list-item-title>
              <v-list-item-subtitle>{{item.Konfektionsgroesse}}</v-list-item-subtitle>
            </v-col>

            <v-col>
              <v-spacer></v-spacer>
            </v-col>

          </v-row>
        </v-list-item>

      </v-list>

</v-container>
</template>

<style scoped>

</style>