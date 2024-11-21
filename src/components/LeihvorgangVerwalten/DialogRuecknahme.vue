<script setup>
import {computed, ref, watch} from 'vue'
import store from "@/store/store.js";
import AuthenticationService from "@/services/AuthenticationService.js";
import { expansionForLeihvorgang } from "@/scripte/globalFunctions.js"
const showDialog = computed(()=> store.getters.getShowDialogRuecknahmeArtikel.showDialog);
const artikelDetails = computed(()=> store.getters.getShowDialogRuecknahmeArtikel.artikelDetails)
const memberName = computed(()=> store.getters.getShowDialogRuecknahmeArtikel.memberName)
const textBemerkung = ref('');
const stateItems = ref([]);
const selectedItem = ref(null);

const props = defineProps({
  member: Object,
  itemReturn: Object,
})

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

function handleSelectionChange(){
    console.log('selectedItem',selectedItem.value);
}

async function dialogClose(){
  store.dispatch('setShowDialogRuecknahmeArtikel', {
    showDialog: false,
    IDinventarBuchungenPositionen: '',
    bemerkung: '',
    artikelDetails: {},
    artikelZustand: '',
    memberName: '',
    idMitglied: ''
  });
  await expansionForLeihvorgang(props.member, true);
}

async function dialogSave(){

  if(!selectedItem.value) {
    console.log('selectedItem ist leer');
    alert("Bitte einen Zustand auswählen")
    return;
  }

  store.dispatch('setShowDialogRuecknahmeArtikel', {
    showDialog: false,
    IDinventarBuchungenPositionen: '',
    bemerkung: textBemerkung.value,
    artikelDetails: {},
    artikelZustand: selectedItem.value.IDInventarZustand,
    memberName: '',
    idMitglied: ''
  });

  //Die Rücknahme an das Backend übermitteln
  try{
    const respone = await AuthenticationService.leihvorgangRuecknahmeArtikel({
      IDinventarBuchungenPositionen: store.getters.getShowDialogRuecknahmeArtikel.IDinventarBuchungenPositionen,
      bemerkung: store.getters.getShowDialogRuecknahmeArtikel.bemerkung,
      artikelZustand: store.getters.getShowDialogRuecknahmeArtikel.artikelZustand,
      IDBenutzer: localStorage.idBenutzer, //ID des Benutzers der die Buchung durchführt
      IDInventarArtikel: store.getters.getShowDialogRuecknahmeArtikel.artikelDetails.ia_IDInventarArtikel,
      IDInventarBuchungen: store.getters.getShowDialogRuecknahmeArtikel.artikelDetails.ibp_IDInventarBuchungen,
      Menge: 1,
      IDVerein: localStorage.idVerein,
    })

    if(artikelDetails.value.ia_externeInventarNummerPflicht === 1){
      try{
        const responseExterneNummerFreigeben = await AuthenticationService.leihvorgangInventarExterneNummernFreigeben([artikelDetails.value.ibp_externeInventarNummer])
        console.log('responseExterneNummerFreigeben', responseExterneNummerFreigeben)
      }catch(err)
      {
        console.log('Fehler ExterneNummerVergeben/responseExterneNummerFreigeben')
      }
    }

    console.log('response von leihvorgangRuecknahmeArtikel: ',respone)
  }catch(err){
    console.log('Fehler in leihvorgangRuecknahmeArtikel', err)
    alert('Fehler bei Rücknahme des Artikels')
    return;
  }
  console.log('getShowDialogRuecknahmeArtikel', store.getters.getShowDialogRuecknahmeArtikel)

  //reload der Artikel veranlassen
  await expansionForLeihvorgang(props.member, true)
  console.log('selectedItem', selectedItem.value.IDInventarZustand);
  console.log('getShowAusgeliehenAbgeschlossen.idMitglied',store.getters.getShowAusgeliehenAbgeschlossen.idMitglied)
  selectedItem.value = null;
  textBemerkung.value = '';
  store.dispatch('setMember', props.member)//Wird für die m_LeihvorgangVerwalten benötigt, um Reaktivität zu gewährleisten
  alert('Artikel-Rücknahme wurde gebucht')
}

</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
        v-model="showDialog"
        max-width="600"
    >
    <v-container fluid>
      <v-row>
        <v-col>
          <v-card
          >
            <v-card-title class="mobile-text-small pb-0">Rücknahme:</v-card-title>
            <v-card-subtitle class="mobile-text-small pb-0">{{props.member.easyVereinMitglied_firstName}} {{props.member.easyVereinMitglied_familyName}}</v-card-subtitle>
            <v-card-subtitle class="mobile-text-small">{{artikelDetails.ia_ArtikelBezeichnung}} | {{artikelDetails.konfektionsGroesse_Konfektionsgroesse}} | {{artikelDetails.farbe}}</v-card-subtitle>
            <v-card-subtitle v-if="artikelDetails.ibp_externeInventarNummer" class="mobile-text-small">{{artikelDetails.ibp_externeInventarNummer}}</v-card-subtitle>
            <v-card-text>

              <v-select
                  class="mobile-text-small"
                  v-model="selectedItem"
                  :items="stateItems"
                  :item-title="i => i.Bezeichnung"
                  :item-value="i => i.IDInventarZustand"
                  label="Bitte den Zustand wählen"
                  persistent-hint
                  return-object
                  variant="solo-filled"
                  @update:modelValue="handleSelectionChange"
              ></v-select>


             <v-text-field
             class="mobile-text-small"
             label="Bemerkung (z.B. über den Zustand)"
             v-model="textBemerkung"
             variant="solo-filled"
             >

             </v-text-field>

            </v-card-text>

            <v-card-actions>
              <v-container fluid class="mb-0 mt-0">
                <v-row no-gutters>
                  <v-col cols="12" sm="6" class="d-flex justify-end py-0 pr-1 mt-1">
                    <v-btn
                        block
                        color="primary"
                        text="Rücknahme"
                        variant="flat"
                        @click="dialogSave()"
                    ></v-btn>
                  </v-col>
                  <v-col cols="12" sm="6" class="d-flex justify-end py-0 pr-1 mt-1">
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
        </v-col>
      </v-row>
    </v-container>
    </v-dialog>
  </div>
</template>

<style scoped>

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

</style>