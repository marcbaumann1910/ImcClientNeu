<script setup>
import {ref, onMounted, computed} from 'vue'
import { useDisplay } from "vuetify";
import AuthenticationService from "@/services/AuthenticationService.js";
import { notifyError, notifySuccess } from '@/scripte/notifications.js';
import Notifications from "@/components/Notifications.vue";
import OverlayWaiting from "@/components/OverlayWaiting.vue";
import DialogYesNoCancel from "@/components/DialogYesNoCancel.vue"
import store from "@/store/store.js";
import { useRouter } from 'vue-router'
const abrechnungsDaten = ref([]);
const abrechnungsJahr = ref([]);
const { smAndDown } = useDisplay();
const selectAbrechnungsJahr = ref();
const searchMitglied = ref();
const inProgress = ref(false);
const showDialogYesNoCancel = computed(()=> store.getters.getShowDialogYesNoCancel.showDialog)
const router = useRouter()


onMounted(()=> {
  loadData()
  console.log('selectAbrechnungsJahr.value', selectAbrechnungsJahr.value)

  selectAbrechnungsJahr.value = store.getters.getSelectAbrechnungsJahr

})

function navigateToAbrechnungDetails(item){
  router.push({name: 'abrechnungDetails', query: {
    jahr: selectAbrechnungsJahr.value || new Date().getFullYear(), //Falls noch kein Jahr gewählt wurde, dann das aktuelle Jahr
    idMitglied: item.id,
    nameMitglied: `${item.firstName} ${item.familyName}`
  }});

}

//Suche nach Mitgliedern
const filderdMitglieder = computed(() => {
  if (!searchMitglied.value) {
    // Wenn kein Suchbegriff eingegeben wurde, gib alle Mitglieder zurück
    return abrechnungsDaten.value;
  }
  // Ansonsten filtere die Mitglieder basierend auf dem Suchbegriff
  return abrechnungsDaten.value.filter((item) => {
    const fullName = `${item.firstName} ${item.familyName} ${item.city}`.toLowerCase();
    return fullName.includes(searchMitglied.value.toLowerCase());
  });
});


function getAbrechnungsDaten() {

  // Überprüfe zuerst, ob abrechnungsJahr.value vorhanden und ein Array ist
  if (!abrechnungsJahr.value || !Array.isArray(abrechnungsJahr.value)) {
    return []; // Gib ein leeres Array zurück, falls noch keine Daten vorhanden
  }

  let jahr = '';
  if(!selectAbrechnungsJahr.value){
    jahr = new Date().getFullYear();
  }
  else{
    jahr = selectAbrechnungsJahr.value;
    store.commit('setSelectAbrechnungsJahr', jahr);
  }
  //console.log('jahr',jahr)
  const filtered =  abrechnungsJahr.value.filter(item => item.AbrechnungsJahr === jahr);

  //console.log('filtered',filtered);
  return filtered;
}

async function loadData(){
  try{
    const response = await AuthenticationService.abrechnungsDaten(selectAbrechnungsJahr.value = store.getters.getSelectAbrechnungsJahr);
    abrechnungsDaten.value = response.data.abrechnungsDaten;
    abrechnungsJahr.value = response.data.abrechnungsJahr;
    console.log(abrechnungsJahr, abrechnungsDaten);
  }catch(error){
    notifyError('Abrechnungsdaten konnten nicht abgerufen werden');
    console.log('Abrechnungsdaten konnten nicht abgerufen werden', error);
  }
}

async function createInvoice(idMitglied, sumOffen){

  const wert = Number(sumOffen); // oder parseFloat(sumOffen)

  if(wert === 0 || wert === 0.00){
    const result = await store.dispatch('setShowDialogYesNoCancel', {
      showDialog: true,
      title: 'Abrechnung',
      text: 'Keine Positionen zum abrechnen!',
      showButtonOK: true
    });
    return
  }

  const result = await store.dispatch('setShowDialogYesNoCancel', {
    showDialog: true,
    title: 'Abrechnung',
    text: 'Möchten Sie die Abrechnung durchführen ?'
  });

  if(result === 'no' || result === 'cancel'){
    return;
  }

  try{
    inProgress.value = true;
    const response = await AuthenticationService.abrechnungNachMitglied({
      idMitglied: idMitglied,
      jahr: selectAbrechnungsJahr.value || new Date().getFullYear(), //Sollte noch kein Jahr ausgewählt worden sein, ist es das aktuelle Jahr
      IDBenutzer: store.getters.getUserData.idBenutzer,
      IDVerein: store.getters.getUserData.idVerein,
      VwzBeschreibung: "Abrechnung Mietgebühren",
    })
    await loadData();
    console.log('response createInvoice', response)
    notifySuccess(`Die Rechnung wurde erfolgreich erstellt. ${response.data.newInvoiceID}`)
  }catch(error){
    // PRÜFUNG AUF DEN KRITISCHEN SYNCHRONISATIONSFEHLER
    if (error.response && error.response.status === 500 && error.response.data.manualActionRequired) {
      const invoiceID = error.response.data.newInvoiceID;
      notifyError(`KRITISCHER FEHLER: Rechnung ${invoiceID} wurde erstellt, aber der Status konnte nicht gespeichert werden! Bitte Admin informieren.`);
      console.error('Synchronisationsfehler:', error.response.data);
    } else {
      // Normaler Fehler (API gar nicht erst erreicht oder andere Probleme)
      notifyError('Die Rechnung konnte nicht erstellt werden.');
    }
  }finally {
    inProgress.value = false;
  }
}

async function createInvoiceAllMember() {
  //Filterung der abzurechnenden Kunden
  const billingMembers = abrechnungsDaten.value.filter(fi => Number(fi.countOffen) > 0);

  if(billingMembers.length === 0){
    const result = await store.dispatch('setShowDialogYesNoCancel', {
      showDialog: true,
      title: 'Abrechnung',
      text: `Keine Mitglieder zum abrechnen!`,
      showButtonOK: true
    });
    return;
  }

  const result = await store.dispatch('setShowDialogYesNoCancel', {
    showDialog: true,
    title: 'Abrechnung',
    text: `Möchten Sie ${billingMembers.length} Mitglieder abrechnen ?`
  });

  //Berechnung der benötigen Schritte für die Fortschrittsanzeige
  let percentValueStep = ((1/billingMembers.length) * 100);
  percentValueStep = Math.round(percentValueStep * 100) / 100
  let percentValue = percentValueStep;

  if (result === 'no' || result === 'cancel') {
    return;
  }

  let response = '';
  try {
    inProgress.value = true;
    for (const billingMember of billingMembers) {

          response = await AuthenticationService.abrechnungNachMitglied({
            idMitglied: billingMember.id,
            jahr: selectAbrechnungsJahr.value || new Date().getFullYear(), //Sollte noch kein Jahr ausgewählt worden sein, ist es das aktuelle Jahr
            IDBenutzer: store.getters.getUserData.idBenutzer,
            IDVerein: store.getters.getUserData.idVerein,
            VwzBeschreibung: "Abrechnung Mietgebühren",
          })
          console.log('response createInvoice', response)

      //Übergibt den aktuellen Prozentwert des Fortschritts über vuex an die OverlayWaiting Komponente
      await store.dispatch('setProgressWaiting', {percentValue: percentValue, percent: true})
      percentValue += percentValueStep;
      }

    notifySuccess(`Die Rechnungen wurden erfolgreich erstellt.`)

  }catch(error)
    {
      notifyError('Die Rechnungen konnten nicht erstellt werden');
      console.log('Fehler: Die Rechnungen konnten nicht erstellt werden')
    }
    finally
    {
      await loadData();
      inProgress.value = false;
      await store.dispatch('setProgressWaiting', {percentValue: 0, percent: false})
    }
}

</script>


<template>
  <Notifications/>

  <OverlayWaiting v-if="inProgress"></OverlayWaiting>
  <DialogYesNoCancel v-if="showDialogYesNoCancel"></DialogYesNoCancel>

  <!--Hier sollen alle Abrechnungsfähigen Artikel, zusammengefasst unter dem Mitglied aufgeführt werden  -->
  <!--Die Gesamtsumme der Abrechnungspositionen soll angezeigt werden  -->
  <!--Es soll eine Filterfunktion bzw. Auswahlfunktion nach Jahr geben, sowie eine Suchfunktion nach Mitglied  -->
  <!--Mit Klick auf das Mitglied, soll auf eine neue Seite navigiert werden, wo die Detailansicht verfügbar ist, auch in mobil  -->
  <v-container max-width="1250">
    <h3 class="mobile-text-small pa-0">Abrechnung
      {{ getAbrechnungsDaten().length > 0 ? getAbrechnungsDaten()[0].AbrechnungsJahr : '' }}
    </h3>

    <v-label class="hover mt-2 text-indigo-darken-4" @click="createInvoiceAllMember" >
      <v-icon class="mr-2" color="indigo darken-4">mdi-cash-register</v-icon>
      Alle Mitglieder abrechnen
    </v-label>

    <div class="mt-1">
      <v-row>
      <!--offen, nicht abgerechnete Vorgänge-->
        <v-col cols="12" sm="6" md="4" class="text-start">
          <v-card v-if="smAndDown" class="">
            <v-card-title class="text-center">
              <v-icon size="25">mdi-timer-sand</v-icon>
              {{ getAbrechnungsDaten().length > 0 ? getAbrechnungsDaten()[0].sumOffen.replace('.',',') + ' €' : '' }}
            </v-card-title>
          </v-card>
          <v-card v-else min-height="57">
            <v-card-subtitle class="mt-1">offen</v-card-subtitle>
            <v-card-title>
              {{ getAbrechnungsDaten().length > 0 ? getAbrechnungsDaten()[0].sumOffen.replace('.',',') + ' €' : '' }}
            </v-card-title>
          </v-card>
          <!--Alle Mitglieder abrechnen-->
        </v-col>
        <!--abgerechnete Vorgänge-->
        <v-col cols="12" sm="6" md="4" class="text-start">
          <v-card v-if="smAndDown" >
            <v-card-title class="text-center">
              <v-icon size="25">mdi-cash-check</v-icon>
              {{ getAbrechnungsDaten().length > 0 ? getAbrechnungsDaten()[0].sumAbgerechnet.replace('.',',') + ' €' : '' }}
            </v-card-title>
          </v-card>
          <v-card v-else min-height="57">
            <v-card-subtitle class="mt-1">abgerechnet</v-card-subtitle>
            <v-card-title>
              {{ getAbrechnungsDaten().length > 0 ? getAbrechnungsDaten()[0].sumAbgerechnet.replace('.',',') + ' €' : '' }}
            </v-card-title>
          </v-card>
        </v-col>
        <!--Select nach Abrechnungsjahr-->
        <v-col cols="12" sm="6" md="4" class="text-start">
          <v-select
              class="text"
              v-model="selectAbrechnungsJahr"
              :items="abrechnungsJahr"
              item-title="AbrechnungsJahr"
              item-value="AbrechnungsJahr"
              label="Abrechnungsjahr"
              variant="solo-filled"
              persistent-hint
              @update:modelValue="() => { getAbrechnungsDaten(); loadData(); }"
          ></v-select>
        </v-col>
      </v-row>
    </div>

    <v-text-field
        v-model="searchMitglied"
        class="search-field mt-2"
        label="Suche Mitglied"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        single-line
        color="red"
        label-color="primary"
        base-color="red"
    ></v-text-field>
    <!--v-cards je Mitlgied-->
      <v-card
          v-for="item in filderdMitglieder"
          :key="item.id"
          class="mt-2 mb-2"

      >
        <v-toolbar height="40" class="vToolbarOben align-center">
          <v-toolbar-title class="ma-2 text-white">{{item.AbrechnungsJahr}}</v-toolbar-title>
          <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn
                    icon="mdi-text-search"
                    variant="text"
                    v-bind="props"
                    class="text-white"
                    @click="navigateToAbrechnungDetails(item)"
                ></v-btn>

            </template>
          </v-menu>
        </v-toolbar>
        <v-row>
        <!--Namen, Ort-->
          <v-col cols="12" sm="6" md="4" class="text-start">
            <v-card-title>{{item.firstName}} {{item.familyName}}</v-card-title>
            <v-card-subtitle>{{item.city}}</v-card-subtitle>
          </v-col>
          <!--offener Betrag-->
          <v-col cols="12" sm="6" md="4" class="text-start">
            <v-card-title>
              <v-icon size="25" class="mr-1">mdi-timer-sand</v-icon>
                {{ Math.round(((item.sumOffen) *100) /100).toFixed(2).replace('.',',') }} €
              <v-icon size="25" class="mr-1">mdi-cash-check</v-icon>
              {{ Math.round(((item.sumAbgerechnet) *100) /100).toFixed(2).replace('.',',') }} €
            </v-card-title>
            <v-card-subtitle>
              <v-icon size="12" class="mr-1">mdi-currency-eur</v-icon>
              <span class="mr-11">offen</span>
              <v-icon size="12" class="ml-7">mdi-currency-eur</v-icon>
              <span class="ml-1">abgerechnet</span>
            </v-card-subtitle>
          </v-col>
          <!--Anzahl Positionen-->
          <v-col cols="12" sm="6" md="4" class="text-starts">
            <v-card-title>
              <v-icon size="25" class="mr-1">mdi-timer-sand</v-icon>
              {{item.countOffen}} St.
              <v-icon size="25" class="mr-1">mdi-cash-check</v-icon>
              {{item.countAbgerechnet}} St.
            </v-card-title>
            <v-card-subtitle>
              <v-icon size="12" class="mr-1">mdi-counter</v-icon>
              <span class="mr-11">offen</span>
              <v-icon size="12" class="ml-0">mdi-counter</v-icon>
              <span class="ml-1">abgerechnet</span>
            </v-card-subtitle>
          </v-col>
        </v-row>
       <!--PDF Symbol und Links zur Rechnung-->

        <v-card class="bg-grey-lighten-4 mt-2">
          <div class="rechnungs-container">
            <div
                v-for="(rg, index) in item.RechnungData"
                :key="index"
                class="rechnungs-item"
            >
              <v-icon color="red" class="icon-margin">mdi-file-pdf-box</v-icon>
              <a :href="rg.RechnungPfad" target="_blank">{{ rg.RechnungID }}</a>
            </div>
          </div>
        </v-card>





        <v-toolbar height="40" class="vToolbarUnten mt-0">
          <!--Title ist nur da, damit der Button zentriert ist -->
          <v-toolbar-title></v-toolbar-title>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                  prepend-icon="mdi-cash-register"
                  variant="text"
                  v-bind="props"
                  class="text-white"
                  @click="createInvoice(item.id, item.sumOffen)"
              >abrechnen</v-btn>
            </template>
          </v-menu>
          <!--Title ist nur da, damit der Button zentriert ist -->
          <v-toolbar-title></v-toolbar-title>
        </v-toolbar>
      </v-card>

  </v-container>



  </template>

<style scoped>

.vToolbarOben{
  background:linear-gradient(90deg,  #1A237E 15%,  #1976D2 85%);
}

.vToolbarUnten{
  background:linear-gradient(90deg,  #263238 15%,  #546E7A 85%);
}

.text {
  font-size: 20px; /* Standardgröße für größere Bildschirme */
}

/* Textgröße für mobile Geräte */
@media (max-width: 600px) {
  .mobile-text-small {
    font-size: 16px !important;
  }
}

/* Textgröße für größere Geräte */
@media (min-width: 601px) {
  .mobile-text-small {
    font-size: 24px !important;
  }
}

@media (max-width: 600px) {
  /* Textgröße für mobile Geräte in v-select */
  :deep(.mobile-text-small) .v-field-label,
  :deep(.mobile-text-small) .v-field__input {
    font-size: 16px !important;
  }
}

@media (min-width: 601px) {
  /* Textgröße für größere Geräte in v-select */
  :deep(.mobile-text-small) .v-field-label,
  :deep(.mobile-text-small) .v-field__input {
    font-size: 24px !important;
  }
}

.rechnungs-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 10px;
}

.rechnungs-item {
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
}

.icon-margin {
  margin-right: 5px;
}

.hover:hover{
  cursor: pointer;
  transform: scale(1.1);
}

</style>