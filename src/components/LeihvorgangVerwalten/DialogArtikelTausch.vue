<script setup>
import { ref, computed, watch } from 'vue';
import store from "@/store/store.js";
import { expansionForLeihvorgang } from "@/scripte/globalFunctions.js";
import AuthenticationService from "@/services/AuthenticationService.js";
const textBemerkung = ref('');
const stateItems = ref([]);
const selectedItem = ref(null);

const props = defineProps({
  member: Object
})

//Ausführlich siehe Doku
const showDialog = computed({
  get() {
    return store.getters.getShowDialogArtikelTausch.showDialog;
  },
  set(value) {
    store.dispatch('setShowDialogArtikelTausch', {
      ...store.getters.getShowDialogArtikelTausch,
      showDialog: value,
    });
  }
});

// Watcher zum Abrufen der State Items beim Öffnen des Dialogs
watch(showDialog, (newVal) => {
  if(newVal){
    fetchItems();
  }
});

const artikelDetails = computed(()=> store.getters.getShowDialogArtikelTausch.artikelDetails);

async function fetchItems() {
  try{
    const response = await AuthenticationService.leihvorgangArtikelTausch(artikelDetails.value.ia_IDInventarKategorie)
    stateItems.value = response.data
    console.log('Erfolgreich leihvorgangArtikelTausch', fetchItems)
  }catch(error){
    console.log('Fehler in leihvorgangArtikelTausch', error)
  }
}

function handleSelectionChange(){

}

function dialogClose(){
  showDialog.value = false;
}

async function dialogSave(){
  if(newNumber.value === '' && newNumber.value === undefined){
    alert('Bitte eine Nummer eingeben!')
    return;
  }

  try{
    const response = await AuthenticationService.leihvorgangNummerAendern({
      IDinventarBuchungenPositionen: idInventarArtikel.value,
      neueExterneInventarNummer: newNumber.value,
    })

  }catch(err){
    alert('Vorgang fehlgeschlagen. Nummer konnte nicht geändert werden')
    console.log(err)
    return;
  }

  await expansionForLeihvorgang(props.member, true)
  showDialog.value = false;
  alert('Die Nummer wurde erfolgreich geändert!')
  newNumber.value = '';
}

</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
        v-model="showDialog"
        max-width="600"
    >

      <v-card
          prepend-icon="mdi-sync"
          :title="`Tausch: ${artikelDetails.ia_ArtikelBezeichnung} | ${artikelDetails.konfektionsGroesse_Konfektionsgroesse} | ${artikelDetails.farbe}`"
          :subtitle="`${props.member.easyVereinMitglied_firstName} ${props.member.easyVereinMitglied_familyName}`"
      >
        <v-card-text>

          <v-select
              v-model="selectedItem"
              :items="stateItems"
              :item-title="i => i.ArtikelBezeichnung"
              :item-value="i => i.IDInventarArtikel"
              label="Bitte den neuen Artikel wählen"
              persistent-hint
              return-object
              single-line
              @update:modelValue="handleSelectionChange"
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