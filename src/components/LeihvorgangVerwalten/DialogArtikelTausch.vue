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
      IDBenutzer: store.getters.getUserData.idBenutzer, //ID des Benutzers der die Buchung durchführt
      IDInventarArtikel: selectedItemNewChoose.value.IDInventarArtikel, //neue, getauschte IDInventarArtikel
      Menge: 1,
      Preis: selectedItemNewChoose.value.Preis, //neuer, getauschter Preis
      externeInventarNummer: textExterneInventarNummer.value || selectExterneInventarNummern.value, //neue, getauschte externeInventarNummer
      AusgeliehenBis: 'NULL',
      Bemerkung: textBemerkung.value,
      IDInventarZustand: selectedItemZustand.value.IDInventarZustand,
      IDVerein: store.getters.getUserData.idVerein,
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
  store.dispatch('setMember', props.member)//Wird für die m_LeihvorgangVerwalten benötigt, um Reaktivität zu gewährleisten
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
        <div class="d-flex justify-center align-center">
          <v-card-title class="mobile-text-small">Artikel tauschen:</v-card-title>
          <v-spacer></v-spacer>
          <v-btn v-if="!mdAndUp" icon="mdi-close" size="12px" class="mr-4" @click="dialogClose"></v-btn>
        </div>
        <v-card-subtitle class="mobile-text-small">{{props.member.easyVereinMitglied_firstName}} {{props.member.easyVereinMitglied_familyName}}</v-card-subtitle>
        <v-card-subtitle class="mobile-text-small">{{artikelDetails.ia_ArtikelBezeichnung}} | {{artikelDetails.konfektionsGroesse_Konfektionsgroesse}} | {{artikelDetails.farbe}}</v-card-subtitle>
        <v-card-subtitle class="mobile-text-small">{{artikelDetails.ibp_externeInventarNummer}}</v-card-subtitle>

        <v-card-text class="mb-0 pb-0">
          <v-container fluid>
            <v-row no-gutters>
              <v-col cols="12">
                <!-- Erster Select -->
                <v-select
                    class="mobile-text-small custom-no-margin"
                    v-model="selectedItemNewChoose"
                    :item-props="itemProbs"
                    :items="stateItemsArtikel"
                    label="Artikel wählen"
                    persistent-hint
                    return-object
                    single-line
                    dense
                    variant="solo-filled"
                    @update:modelValue="handleSelectionChange"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <!-- Zweiter Select -->
                <v-select
                    class="mobile-text-small mt-0 mb-0 custom-no-margin"
                    v-model="selectedItemZustand"
                    :items="stateItemsZustand"
                    :item-title="i => i.Bezeichnung"
                    :item-value="i => i.IDInventarZustand"
                    label="Zustand wählen"
                    persistent-hint
                    return-object
                    single-line
                    dense
                    variant="solo-filled"
                    @update:modelValue="handleSelectionChange2"
                ></v-select>
              </v-col>

              <!-- Bedingte Anzeige der Textfelder -->
              <v-col cols="12" v-if="!artikelDetails.ia_externeInventarNummerPflicht">
                <v-text-field
                    label="Neue Nummer eingeben"
                    v-model="textExterneInventarNummer"
                    class="mt-0 mb-0 custom-no-margin"
                    dense
                    variant="solo-filled"
                ></v-text-field>
              </v-col>

              <v-col cols="12" v-else>
                <v-select
                    class="mobile-text-small mt-0 mb-0 custom-no-margin"
                    v-model="selectExterneInventarNummern"
                    :items="inventarExterneNummern"
                    item-title="ExterneNummer"
                    item-value="ExterneNummer"
                    label="Inventar Nummer wählen"
                    persistent-hint
                    dense
                    variant="solo-filled"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                    class="mobile-text-small mb-0 mt-0 custom-no-margin"
                    label="Bemerkung (z.B. über den Zustand)"
                    v-model="textBemerkung"
                    variant="solo-filled"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="pt-0 mb-0 mt-0">
          <v-container fluid class="mb-0 mt-0">
            <v-row no-gutters>
              <v-col cols="12" sm="6" class="d-flex justify-end py-0 mt-1">
                <v-btn
                    block
                    color="primary"
                    text="Tausch durchführen"
                    variant="flat"
                    @click="dialogSave()"
                ></v-btn>
                <v-spacer></v-spacer>
              </v-col>
              <v-col cols="12" sm="6" class="d-flex justify-end py-0 mt-1">
                <v-btn
                    block
                    color="grey"
                    text="Schließen"
                    variant="tonal"
                    @click="dialogClose"
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

/* Textgröße für mobile Geräte */
@media (max-width: 600px) {
  .mobile-text-small {
    font-size: 14px !important;
  }
}

/* Textgröße für größere Geräte */
@media (min-width: 601px) {
  .mobile-text-small {
    font-size: 16px !important;
  }
}

@media (max-width: 600px) {
  /* Textgröße für mobile Geräte in v-select */
  :deep(.mobile-text-small) .v-field-label,
  :deep(.mobile-text-small) .v-field__input {
    font-size: 14px !important;
  }
}

@media (min-width: 601px) {
  /* Textgröße für größere Geräte in v-select */
  :deep(.mobile-text-small) .v-field-label,
  :deep(.mobile-text-small) .v-field__input {
    font-size: 16px !important;
  }
}

.custom-no-margin {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.custom-no-padding {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
