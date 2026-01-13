<script setup>
import store from '../../store/store.js';
import {computed, onMounted, watchEffect} from "vue";
import DialogExterneNummer from "@/components/Leihvorgang/DialogExterneNummer.vue";
//##########################################################################################
//Bilderpfad bauen, damit dieser auch auf den Subdomains läuft                             #
const apiBase = import.meta.env.VITE_API_URL;            // https://test.mbdevelop.de/api#
const origin  = apiBase.replace(/\/api\/?$/, "");        // https://test.mbdevelop.de    #
const imageUrl = `${origin}`;                            // <- für Artikelbilder  #
//##########################################################################################
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

function showDialogForExterneID(menge, idArtikel, externeInventarNummerPflicht, idInventarKategorie){
  //Übergabe der Daten aus cartItems vuex-Store
  store.dispatch('setShowDialogExterneInventarNummer', {
    showDialog: true,
    Menge: menge,
    idArtikel: idArtikel,
    externeInventarNummerPflicht: externeInventarNummerPflicht,
    idInventarKategorie: idInventarKategorie,
  });
  console.log('menge',menge)
  console.log('idArtikel', idArtikel)
  console.log('idInventarKategorie', idInventarKategorie)
  console.log('idArtikel from vuxe', store.getters.getShowDialogExterneInventarNummer.idArtikel);
}
</script>

<template>
  <v-container max-width="320px">
    <div class="mb-3">
       <span><b>Gesamtpreis: {{ (Math.round(cartItemsAmount *100) /100).toFixed(2) }} €</b></span>
    </div>
    <v-card
        v-for="(item, index) in cartItems"
        :key="index"
        class="mb-2"
    >
      <v-toolbar color="#C62828" dark height="40" class="align-center">
        <v-toolbar-title class="ml-2">{{ item.ArtikelBezeichnung }}</v-toolbar-title>
      </v-toolbar>

      <v-list class="pa-2 mt-2">
        <v-row no-gutters>
          <v-col cols="7">
            <v-list-item-subtitle class="mb-1">
<!--              <v-icon size="small">mdi-palette</v-icon>-->
              Farbe: {{ item.Farbe }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="mb-1">
<!--            <v-icon size="small">mdi-currency-eur</v-icon>-->
              Preis: {{ item.Preis }} €
            </v-list-item-subtitle>
            <v-list-item-subtitle class="mb-1"
            >
<!--              <v-icon size="small">mdi-ruler</v-icon> -->
            Größe: {{ item.Konfektionsgroesse }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="mb-1 pb-1"
            >
<!--              <v-icon size="small">mdi-cart</v-icon>-->
              Menge: {{ item.Menge }}
            </v-list-item-subtitle>

          </v-col>
          <v-col cols="5" class="justify-center">
            <v-avatar size="60" class="ml-4 mr-4">
              <v-img
                  :src="`${imageUrl}${item.Bildpfad}`"
              ></v-img>
            </v-avatar>
          </v-col>
        </v-row>
        <v-divider class="mt-2 mb-1"></v-divider>
        <v-row no-gutters>
          <v-col cols="6">
            <v-chip class="custom-chip mb-2 mt-4" outlined color="#3949AB" variant="flat">
              <!-- Minus Button -->
              <div @click="handleMinusClick(item.IDInventarArtikel, item.Menge)" class="hover px-2">
                <v-icon size="16" class="">mdi-minus</v-icon>
              </div>

              <!-- Vertikaler Divider -->
              <v-divider vertical class="chip-divider"></v-divider>

              <!-- Menge Text -->
              <div class="chip-text ml-2 mr-2">
                <span>{{ item.Menge }}</span>
              </div>

              <!-- Vertikaler Divider -->
              <v-divider vertical class="chip-divider"></v-divider>

              <!-- Plus Button -->
              <div @click="handlePlusClick(item.IDInventarArtikel, item.Menge, item.Bestand)" class="hover px-2">
                <v-icon size="16" class="ml-1 mr-2">mdi-plus</v-icon>
              </div>
            </v-chip>
          </v-col>

          <!-- Externe Nummer -->
          <v-col cols="3">
            <div class="mt-4">
              <template v-if="store.getters.getExterneNummernCount(item.IDInventarArtikel) > 0">
                <v-badge
                    color="green"
                    :content="store.getters.getExterneNummernCount(item.IDInventarArtikel)"
                >
                  <v-icon
                      class="mt-0 ml-2"
                      size="x-large"
                      @click="()=> showDialogForExterneID(item.Menge, item.IDInventarArtikel, item.ExterneInventarNummerPflicht, item.IDInventarKategorie)"
                  >mdi-keyboard-outline</v-icon>
                </v-badge>
              </template>
              <template v-else>
                <v-icon
                    class="mt-0 ml-2"
                    size="x-large"
                    @click="()=> showDialogForExterneID(item.Menge, item.IDInventarArtikel, item.ExterneInventarNummerPflicht, item.IDInventarKategorie)"
                >mdi-keyboard-outline</v-icon>
              </template>
            </div>

          </v-col>
          <!-- Löschen -->
          <v-col cols="3">
            <v-icon
                class="mt-4 ml-1"
                size="large"
                @click="deleteItem(item.IDInventarArtikel)"
            >mdi-trash-can</v-icon>
          </v-col>
        </v-row>
      </v-list>
      <span v-if="item.ExterneInventarNummerPflicht" class="font-weight-bold text-caption ml-2" >Externe Nummer muss erfasst werden</span>
    </v-card>
  </v-container>
</template>

<style scoped>

</style>