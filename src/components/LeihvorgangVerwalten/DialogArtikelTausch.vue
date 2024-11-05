<script setup>
import { ref, computed, watch } from 'vue';
import store from "@/store/store.js";
import { expansionForLeihvorgang } from "@/scripte/globalFunctions.js";
import AuthenticationService from "@/services/AuthenticationService.js";
const textBemerkung = ref('');
const selectedItemNewChoose = ref(null);
const selectedItemZustand = ref(null);
const stateItemsArtikel = ref([]);
const stateItemsZustand = ref([]);

const newNumber = ref('');

const artikelDetails = computed(()=> store.getters.getShowDialogArtikelTausch.artikelDetails);

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

//Aufbereitung fürs Select mit Subtitle
function itemProbs(stateItemsArtikel){
  return {
    title: stateItemsArtikel.ArtikelBezeichnung,
    subtitle: `
              Bestand: ${parseInt(stateItemsArtikel.Bestand.toString())}
              Farbe: ${stateItemsArtikel.Farbe}
              Größe: ${stateItemsArtikel.Konfektionsgroesse}
              Preis: ${ Math.round(((stateItemsArtikel.Preis) *100) /100).toFixed(2) } €
              `,
    disabled: parseInt(stateItemsArtikel.Bestand.toString()) === 0, //Wenn Bestand 0 dann Eintrag disabled
  }
}

async function fetchItems() {
  try{
    const responseArtikel = await AuthenticationService.leihvorgangGetArtikelTausch(artikelDetails.value.ia_IDInventarKategorie)
    stateItemsArtikel.value = responseArtikel.data
    console.log('Erfolgreich leihvorgangArtikelTausch', fetchItems)
    const responseZustand = await AuthenticationService.leihvorgangArtikelZustand();
    stateItemsZustand.value = responseZustand.data
  }catch(error){
    console.log('Fehler in leihvorgangArtikelTausch', error)
  }
}

function handleSelectionChange(){
  console.log('selectedItemNewChoose:',selectedItemNewChoose.value);
  console.log('selectedItemNewChoose IDInventarArtikel:',selectedItemNewChoose.value.IDInventarArtikel);
  console.log('selectedItemNewChoose IDInventarBuchungen:',selectedItemNewChoose.value.IDInventarBuchungen);
  console.log('member',props.member);
}

function handleSelectionChange2(){

}

function dialogClose(){
  showDialog.value = false;
}

async function dialogSave(){
  if(selectedItemNewChoose.value === '' && selectedItemNewChoose.value === undefined){
    alert('Bitte einen Artikel auswählen!')
    return;
  }

  try{
    const response = await AuthenticationService.leihvorgangArtikelTauschen({
      IDInventarBuchungen: artikelDetails.value.ibp_IDInventarBuchungen, //ursprüngliche IDInventarBuchungen
      IDInventarArtikel: selectedItemNewChoose.value.IDInventarArtikel, //neue, getauschte IDInventarArtikel
      Menge: 1,
      Preis: selectedItemNewChoose.value.Preis, //neuer, getauschter Preis
      externeInventarNummer: '', //neue, getauschte externeInventarNummer
      AusgeliehenBis: '',
      Bemerkung: '',
      IDInventarZustand: ''
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
              v-model="selectedItemNewChoose"
              :item-props="itemProbs"
              :items="stateItemsArtikel"
              label="Bitte den neuen Artikel wählen"
              persistent-hint
              return-object
              single-line
              @update:modelValue="handleSelectionChange"
          ></v-select>

          <v-select
              v-model="selectedItemZustand"
              :items="stateItemsZustand"
              :item-title="i => i.Bezeichnung"
              :item-value="i => i.IDInventarZustand"
              label="Bitte den Zustand wählen"
              persistent-hint
              return-object
              single-line
              @update:modelValue="handleSelectionChange2"
          ></v-select>

          <v-text-field
              label="Neue Nummer"
              v-model="newNumber"
          >
          </v-text-field>

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