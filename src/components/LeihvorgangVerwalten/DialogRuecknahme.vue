<script setup>
import {computed, ref, watch} from 'vue'
import store from "@/store/store.js";
import AuthenticationService from "@/services/AuthenticationService.js";
const showDialog = computed(()=> store.getters.getShowDialogRuecknahmeArtikel.showDialog);
const IDinventarBuchungenPositionen = computed(() => store.getters.getShowDialogRuecknahmeArtikel.IDinventarBuchungenPositionen)
const artikelDetails = computed(()=> store.getters.getShowDialogRuecknahmeArtikel.artikelDetails)
const memberName = computed(()=> store.getters.getShowDialogRuecknahmeArtikel.memberName)
const textBemerkung = ref('');
const stateItems = ref([]);
const selectedItem = ref(null);

// Watcher zum Abrufen der State Items beim Öffnen des Dialogs
watch(showDialog, (newVal) => {
  if(newVal){
    fetchStateItems();
  }
});

// Funktion zum Abrufen der State Items
async function fetchStateItems(){
  try{
    const response = await AuthenticationService.leihvorgangArtikelZustand();
    stateItems.value = response.data;
    console.log('stateItems erfolgreich abgerufen', stateItems.value);
  } catch(err) {
    console.log('Fehler beim Abruf der Werte Artikel-Zustand', err);
  }
}

function dialogClose(){
  store.dispatch('setShowDialogRuecknahmeArtikel', {
    showDialog: false,
    IDinventarBuchungenPositionen: '',
    bemerkung: '',
    artikelDetails: {},
    memberName: ''
  });
}

function dialogSave(){
  store.dispatch('setShowDialogRuecknahmeArtikel', {
    showDialog: false,
    IDinventarBuchungenPositionen: '',
    bemerkung: textBemerkung.value,
    artikelDetails: {},
    memberName: ''
  });
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
          :subtitle="`${memberName}`"
      >
        <v-card-text>

          <v-select
              v-model="selectedItem"
              :items="stateItems"
              :item-title="i => i.Bezeichnung"
              :item-value="i => i.IDInventarZustand"
              label="Bitte den Zustand wählen"
              persistent-hint
              return-object
              single-line
          ></v-select>


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