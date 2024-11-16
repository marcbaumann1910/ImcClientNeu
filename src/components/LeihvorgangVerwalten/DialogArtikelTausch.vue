<script setup>
import { ref, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';

import store from "@/store/store.js";
import { expansionForLeihvorgang, fetchInventarExterneNummer } from "@/scripte/globalFunctions.js";
import AuthenticationService from "@/services/AuthenticationService.js";

const textBemerkung = ref('');
//Enthält die Werte nach einer Änderung der Select-Box
const selectedItemNewChoose = ref(null);
const selectedItemZustand = ref(null);
//Nimmt die Daten aus Datenbank entgegen
const stateItemsArtikel = ref([]);
const stateItemsZustand = ref([]);
const textExterneInventarNummer = ref('');
const inventarExterneNummern = ref([]);
const selectExterneInventarNummern = ref('');

const artikelDetails = computed(()=> store.getters.getShowDialogArtikelTausch.artikelDetails);

const props = defineProps({
  member: Object
})

const { mdAndUp } = useDisplay();

const dialogWidth = computed(() => {
  return mdAndUp.value ? 600 : '90vw';
});

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
watch(showDialog, async (newVal) => {
  if (newVal) {
    await fetchItems();

    inventarExterneNummern.value = await fetchInventarExterneNummer(artikelDetails.value.ia_IDInventarKategorie);
    if (inventarExterneNummern.value == null) {
      alert('Fehler beim Abruf der Inventar-Nummern!')
      return;
    }
  }
});

//Aufbereitung fürs Select mit Subtitle
function itemProbs(stateItemsArtikel){
  return {
    title: `
              Größe: ${stateItemsArtikel.Konfektionsgroesse}
              Bestand: ${parseInt(stateItemsArtikel.Bestand.toString())}
              Farbe: ${stateItemsArtikel.Farbe}
              Preis: ${ Math.round(((stateItemsArtikel.Preis) *100) /100).toFixed(2) } €
              `,
    subtitle: stateItemsArtikel.ArtikelBezeichnung,
    disabled: parseInt(stateItemsArtikel.Bestand.toString()) === 0, //Wenn Bestand 0 dann Eintrag disabled


  }
}

async function fetchItems() {
  try{
    //Verfügbare Artikel zur jeweiligen Kategorie abrufen
    const responseArtikel = await AuthenticationService.leihvorgangGetArtikelTausch(artikelDetails.value.ia_IDInventarKategorie)
    stateItemsArtikel.value = responseArtikel.data
    console.log('Erfolgreich leihvorgangArtikelTausch', fetchItems)
    //Abruf der Zustände eines Artikels
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
  console.log('selectedItemZustand', selectedItemZustand)
}

function dialogClose(){
  showDialog.value = false;
  selectedItemNewChoose.value = null;
  selectedItemZustand.value = null;
  textExterneInventarNummer.value = null;
  textBemerkung.value = null;
  selectExterneInventarNummern.value = '';
}

async function dialogSave(){
  if(selectedItemNewChoose.value === '' || selectedItemNewChoose.value === undefined || selectedItemNewChoose.value === null){
    alert('Bitte einen Artikel auswählen!')
    return;
  }

  if(selectedItemZustand.value === '' || selectedItemZustand.value === undefined || selectedItemZustand.value === null){
    alert('Bitte einen Zustand auswählen!')
    return;
  }

  //Wenn v-select sichtbar ist, dann wird gebprüft ob eine Auswahl stattgefunden hat!
  if (artikelDetails.value.ia_externeInventarNummerPflicht === 1) {
    if (!selectExterneInventarNummern.value || selectExterneInventarNummern.value === '') {
      alert('Bitte die Nummer eingeben!');
      return;
    }
  }

  try{
    const response = await AuthenticationService.leihvorgangArtikelTauschen({
      ALT_IDinventarBuchungenPositionen: artikelDetails.value.ibp_IDinventarBuchungenPositionen, //ursprüngliche IDinventarBuchungenPositionen
      ALT_IDInventarArtikel: artikelDetails.value.ia_IDInventarArtikel, //ursprüngliche IDInventarArtikel
      ALT_IDInventarBuchungen: artikelDetails.value.ibp_IDInventarBuchungen, //ursprüngliche IDInventarBuchungen
      IDBenutzer: localStorage.idBenutzer, //ID des Benutzers der die Buchung durchführt
      IDInventarArtikel: selectedItemNewChoose.value.IDInventarArtikel, //neue, getauschte IDInventarArtikel
      Menge: 1,
      Preis: selectedItemNewChoose.value.Preis, //neuer, getauschter Preis
      externeInventarNummer: textExterneInventarNummer.value || selectExterneInventarNummern.value, //neue, getauschte externeInventarNummer
      AusgeliehenBis: 'NULL',
      Bemerkung: textBemerkung.value,
      IDInventarZustand: selectedItemZustand.value.IDInventarZustand
    })

    //Damit die Verfügbarkeit der externeInventarNummer upgedatet werden kann
    if(selectExterneInventarNummern.value){
      try{
        const responseExterneNummerVergeben = await AuthenticationService.leihvorgangInventarExterneNummernVergeben([selectExterneInventarNummern.value])
        console.log('responseExterneNummerVergeben', responseExterneNummerVergeben)
        const responseExterneNummerFreigeben = await AuthenticationService.leihvorgangInventarExterneNummernFreigeben([artikelDetails.value.ibp_externeInventarNummer])
        console.log('responseExterneNummerFreigeben', responseExterneNummerFreigeben)
      }catch(err)
      {
        console.log('Fehler ExterneNummerVergeben/responseExterneNummerFreigeben')
      }

    }

    console.log('Tausch erfolgreich durchgeführt')
  }catch(err){
    alert('Vorgang fehlgeschlagen. Tausch konnt nicht durchgeführt werden')
    console.log(err)
    return;
  }

  showDialog.value = false;
  alert('Tausch wurde erfolgreich durchgeführt!')
  selectedItemNewChoose.value = null;
  selectedItemZustand.value = null;
  textExterneInventarNummer.value = null;
  textBemerkung.value = null;
  selectExterneInventarNummern.value = '';
  await expansionForLeihvorgang(props.member, true)
}

</script>

<template>
  <div class="pa-2 text-center">
    <v-dialog
        v-model="showDialog"
        max-width="600"
    >

      <v-card
      >
        <div class="d-flex flex-column align-center">
          <div class="d-flex align-center">
            <!-- Icon -->
            <v-icon size="36px" class="desktop-only mr-0">mdi-swap-horizontal</v-icon>
            <!-- Titel -->
            <v-card-title class="mb-0 text-sm-body-2 text-md-body-1">
              {{ `Tausch: ${artikelDetails.ia_ArtikelBezeichnung} | ${artikelDetails.konfektionsGroesse_Konfektionsgroesse} | ${artikelDetails.farbe}` }}
            </v-card-title>
          </div>
          <!-- Untertitel -->
          <v-card-subtitle class="ml-4 mt-0 text-sm-body-3 text-md-body-2">
            {{ `${props.member.easyVereinMitglied_firstName} ${props.member.easyVereinMitglied_familyName} | Inventar-Nummer: ${artikelDetails.ibp_externeInventarNummer}` }}
          </v-card-subtitle>
        </div>


        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col cols="12">
                <!-- Erster Select -->
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
              </v-col>

              <v-col cols="12">
                <!-- Zweiter Select -->
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
              </v-col>

              <!-- Bedingte Anzeige der Textfelder -->
              <v-col cols="12" v-if="!artikelDetails.ia_externeInventarNummerPflicht">
                <v-text-field
                    label="Neue Nummer eingeben"
                    v-model="textExterneInventarNummer"
                ></v-text-field>
              </v-col>

              <v-col cols="12" v-else>
                <v-select
                    v-model="selectExterneInventarNummern"
                    :items="inventarExterneNummern"
                    item-title="ExterneNummer"
                    item-value="ExterneNummer"
                    label="Bitte die Inventar Nummer wählen"
                    persistent-hint
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                    label="Bemerkung (z.B. über den Zustand)"
                    v-model="textBemerkung"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-container fluid>
            <v-row>
              <v-col cols="12" sm="6">
                <v-spacer></v-spacer>
                <v-btn
                    text="Schließen"
                    variant="plain"
                    @click="dialogClose"
                ></v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn
                    color="primary"
                    text="Tausch durchführen"
                    variant="tonal"
                    @click="dialogSave()"
                ></v-btn>

              </v-col>
            </v-row>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
@media (max-width: 600px) {
  .mobile-only {
    display: block;
  }
  .desktop-only {
    display: none;
  }
}
@media (min-width: 601px) {
  .mobile-only {
    display: none;
  }
  .desktop-only {
    display: block;
  }
}
</style>