<script setup>
import {computed, ref} from 'vue'
import store from "@/store/store.js";
const showDialog = computed(()=> store.getters.getShowDialogRuecknahmeArtikel.showDialog);
const IDinventarBuchungenPositionen = computed(() => store.getters.getShowDialogRuecknahmeArtikel.IDinventarBuchungenPositionen)
const artikelDetails = computed(()=> store.getters.getShowDialogRuecknahmeArtikel.artikelDetails)
const textBemerkung = ref('');

function dialogClose(){
  store.dispatch("setShowDialogRuecknahmeArtikel", {showDialog: false});
}

function dialogSave(){
  store.dispatch("setShowDialogRuecknahmeArtikel", {showDialog: false, Bemerkung: textBemerkung});

}

</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
        v-model="showDialog"
        max-width="600"
    >
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
            class="text-none font-weight-regular"
            prepend-icon="mdi-account"
            text="Edit Profil"
            variant="tonal"
            v-bind="activatorProps"
        ></v-btn>
      </template>

      <v-card
          prepend-icon="mdi-arrow-down-thin-circle-outline"
          :title="`Rücknahme: ${artikelDetails.inventarArtikel_ArtikelBezeichnung} | ${artikelDetails.konfektionsGroesse_Konfektionsgroesse} | ${artikelDetails.farbe_Bezeichnung}`"
      >
        <v-card-text>
         <v-text-field
         label="Bemerkung (z.B. über den Zustand)"
         v-model="textBemerkung"
         >

         </v-text-field>

        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
              text="Schließen"
              variant="plain"
              @click="dialogClose"
          ></v-btn>

          <v-btn
              color="primary"
              text="Rücknahme ausführen"
              variant="tonal"
              @click="dialogSave()"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>

</style>