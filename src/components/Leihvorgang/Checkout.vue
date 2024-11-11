<script setup>
import store from '../../store/store.js';
import {computed, onMounted, watchEffect} from "vue";
import DialogExterneNummer from "@/components/Leihvorgang/DialogExterneNummer.vue";
const imageUrl = process.env.VITE_API_URL
const cartItems = computed(()=>store.getters.getCartItems);
const cartItemsAmount = computed(()=>store.getters.getCartItemsAmount);

watchEffect(() => {
  cartItems.value.forEach(item => {
    const menge = item.Menge
    const externeIDCount = store.getters.getExterneNummernCount(item.IDInventarArtikel);
    console.log('ExterneInventarNummerPflicht:', item.ExterneInventarNummerPflicht);

    if(menge < externeIDCount){
      console.log('menge < externeIDCount', menge, externeIDCount);
      store.dispatch('setExterneInventarNummerToCartItem', {idArtikel: item.IDInventarArtikel, correctionInventarNummerCount: item.Menge})
    }

  })
})

function handleMinusClick(itemID, currentQuantity){
  if(currentQuantity === 1)
  {
    return;
  }
  store.dispatch('changeCartItemsQuantity', {id: itemID, changeQuantity: -1});
}

function handlePlusClick(itemID, currentQuantity, maxQuantity){
  console.log('current und max', currentQuantity, maxQuantity)
  if(currentQuantity >= maxQuantity)
  {
    return;
  }
  store.dispatch('changeCartItemsQuantity', {id: itemID, changeQuantity: +1});
}

function deleteItem(id){
  store.dispatch('deleteItemFromCart', id);
}

function showDialogForExterneID(menge, idArtikel, externeInventarNummerPflicht){
    store.dispatch('setShowDialogExterneInventarNummer', {showDialog: true, Menge: menge, idArtikel: idArtikel, externeInventarNummerPflicht: externeInventarNummerPflicht});
    console.log('menge',menge)
    console.log('idArtikel', idArtikel)
    console.log('idArtikel from vuxe', store.getters.getShowDialogExterneInventarNummer.idArtikel);
}

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

            <v-chip
                class="d-flex justify-space-between mb-2"
                outlined
            >
              <div @click="handleMinusClick(item.IDInventarArtikel, item.Menge)" class="hover px-2">
                <v-icon>mdi-minus</v-icon>
              </div>
              <v-divider vertical></v-divider>
              <div class="mx-2">
                <span>{{ item.Menge }}</span>
              </div>
              <v-divider vertical></v-divider>
              <div @click="handlePlusClick(item.IDInventarArtikel, item.Menge, item.Bestand)" class="hover px-2">
               <v-icon>mdi-plus</v-icon>
              </div>
            </v-chip>

          </v-col>

          <v-col cols="2" class="d-flex flex-column justify-end align-start align-self-stretch mb-2">
            <v-label @click="deleteItem(item.IDInventarArtikel)" class="hover text-subtitle-2"
            >
              Löschen
            </v-label>
          </v-col>

          <v-col cols="2" class="d-flex flex-column justify-end align-start align-self-stretch mb-2">
            <v-badge
                v-if="store.getters.getExterneNummernCount(item.IDInventarArtikel) > 0"
                color="green"
                :content="store.getters.getExterneNummernCount(item.IDInventarArtikel)"
            >
              <!-- Der Label wird innerhalb des Badges angezeigt -->
              <v-label
                  @click="showDialogForExterneID(item.Menge, item.IDInventarArtikel, item.ExterneInventarNummerPflicht)"
                  class="hover text-subtitle-2 text-blue-darken-4 mt-2"
              >
                {{ item.ExterneInventarNummerPflicht === 1 ? 'Externe Nr. erfassen*' : 'Externe Nr. erfassen' }}

              </v-label>
            </v-badge>
            <!-- Label, das immer angezeigt wird (falls Badge nicht gerendert wird) -->
            <v-label
                v-else
                @click="showDialogForExterneID(item.Menge, item.IDInventarArtikel, item.ExterneInventarNummerPflicht)"
                class="hover text-subtitle-2 text-blue-darken-4 mt-2"
            >
              {{ item.ExterneInventarNummerPflicht === 1 ? '*Externe Nr. erfassen' : 'Externe Nr. erfassen' }}

            </v-label>
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
          <v-list-item-title class="ml-3">(*) Erfassung Externer Nr. pflicht!</v-list-item-title>
        </v-list-item-action>
          <v-spacer></v-spacer>
        <v-list-item-action class="mr-2">
          <v-list-item-title><b>Gesamtpreis: {{ (Math.round(cartItemsAmount *100) /100).toFixed(2) }} €</b></v-list-item-title>
        </v-list-item-action>
        </v-col>

      </v-row>

    </v-list>

  </v-container>
</template>

<style scoped>

.hover:hover{
  cursor: pointer;
  transform: scale(1.1);
}




</style>
