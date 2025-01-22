<script setup>
import {ref, onMounted, computed} from 'vue';
import { useRoute } from 'vue-router';
import AuthenticationService from "@/services/AuthenticationService.js";
import { formatDate } from '@/scripte/globalFunctions.js'
import store from "@/store/store.js";
import DialogYesNoCancel from "@/components/DialogYesNoCancel.vue";
import OverlayWaiting from "@/components/OverlayWaiting.vue";
import Notifications from "@/components/Notifications.vue";
import { notifyError, notifySuccess } from '@/scripte/notifications.js';
const imageUrl = process.env.VITE_API_URL
const route = useRoute();
const abrechnungDetails = ref([]);
const showDialogYesNoCancel = computed(()=> store.getters .getShowDialogYesNoCancel.showDialog)
const inProgress = ref(false);
const btnDisabled = ref(false);



onMounted(()=>{
  console.log('query', route.query);

  if(!route.query){
    console.log('Keine query Daten erhalten!')
    return;
  }

  if(!route.query.idMitglied || !route.query.idMitglied === ''){
    console.log('Keine idMitglied erhalten!')
    return;
  }

  if(!route.query.jahr || !route.query.jahr === ''){
    console.log('Kein jahr erhalten!')
    return;
  }

  if(!route.query.nameMitglied || !route.query.nameMitglied === ''){
    console.log('Kein nameMitglied erhalten!')
    return;
  }

  loadData()
})

async function loadData(){

  try{
    const respone = await AuthenticationService.abrechnungsDetails({
      idMitglied: route.query.idMitglied,
      jahr: route.query.jahr,
    })

    abrechnungDetails.value = respone.data;

    console.log('Abruf erfolgreich Abrechnung Details', abrechnungDetails.value)

  }catch(error){
    console.log('FEHLER: Abruf der Abrechnung Details',error)
  }
}

async function abrechnen(IDinventarBuchungenPositionen, idMitglied, abrechnungsJahr){
  const result = await store.dispatch('setShowDialogYesNoCancel', {
    showDialog: true,
    title: 'Abrechnungsdetails',
    text: 'Möchten Sie die Abrechnung durchführen ?'
  });

  if(result === 'no' || result === 'cancel'){
    return;
  }

  if(!IDinventarBuchungenPositionen || IDinventarBuchungenPositionen===""){
    store.dispatch('setShowDialogYesNoCancel', {
      showDialog: true,
      title: 'Abrechnungsdetails',
      text: 'Fehler InventarPosition: Keinen Wert übergeben',
      showButtonOK: true
    })
    return;
  }
  console.log("IDinventarBuchungenPositionen:", IDinventarBuchungenPositionen)

  try{
    inProgress.value = true;
    const respone = await AuthenticationService.abrechnungNachMitglied({
      idMitglied: route.query.idMitglied,
      jahr: route.query.jahr,
      inventarPosID: IDinventarBuchungenPositionen,
    })

    loadData();

    store.dispatch('setShowDialogYesNoCancel', {
      showDialog: true,
      title: 'Abrechnungsdetails',
      text: 'Rechnung wurde erfolgreich erstellt',
      showButtonOK: true
    })

  }catch(error){
    store.dispatch('setShowDialogYesNoCancel', {
      showDialog: true,
      title: 'Abrechnungsdetails',
      text: 'Fehler beim erstellen der Rechnung',
      showButtonOK: true
    })
    console.log("Fehler beim erstellen der Rechnung", error)
  }finally {
    inProgress.value = false;
  }

}

async function verkauf(){
  const result = await store.dispatch('setShowDialogYesNoCancel', {
    showDialog: true,
    title: 'Abrechnungsdetails',
    text: 'Möchten Sie den Verkauf durchführen ?'
  });

  if(result === 'no' || result === 'cancel'){
    return;
  }
}

async function stornieren(idAbrechnung){

  const result = await store.dispatch('setShowDialogYesNoCancel', {
    showDialog: true,
    title: 'Abrechnungsdetails',
    text: 'Möchten Sie stornieren ?'
  });

  if(result === 'no' || result === 'cancel'){
    return;
  }

  if(!idAbrechnung || idAbrechnung === ''){
    console.log("idAbrechnung ist leer")
  }

  try{
    const response = AuthenticationService.abrechnungStorno(idAbrechnung);
    console.log(`Die Abrechnungsposition ${idAbrechnung} wurde storniert`)
    loadData();
    notifySuccess(`Die Abrechnungsposition ${idAbrechnung} wurde storniert`)
  }catch(error){
    console.log(`Die Abrechnungsposition ${idAbrechnung} konnte nicht storniert werden`)
    notifyError(`Die Abrechnungsposition ${idAbrechnung} konnte nicht storniert werden`);
  }

}

</script>

<template>

  <v-container>

    <DialogYesNoCancel v-if="showDialogYesNoCancel"></DialogYesNoCancel>
    <OverlayWaiting v-if="inProgress"></OverlayWaiting>
    <Notifications/>

    <h1>Abrechnung Details</h1>

    <v-card class="" max-width="400">
      <v-card-title >{{ route.query.nameMitglied }}</v-card-title>
    </v-card>

    <v-card
        class="my-2"
        v-for="item in abrechnungDetails"
        :key="item.IDAbrechnung"
    >

      <v-toolbar height="40" class="vToolbarOben align-center">
        <v-toolbar-title class="ma-2 text-white">{{item.ArtikelBezeichnung}}</v-toolbar-title>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
                variant="text"
                v-bind="props"
                class="text-white"
            ></v-btn>

          </template>
        </v-menu>
      </v-toolbar>

      <v-row>
        <!--Bild und Artikelbezeichnung, Status und Statusdatum-->
        <v-col cols="12" sm="6" md="4" class="text-start">
          <div class="d-flex align-start flex-column">
            <v-avatar class="ma-2" size="60">
              <v-img
                  alt="Avatar"
                  :src="`${imageUrl}${item.Bildpfad}`"
              ></v-img>
            </v-avatar>
            <v-card-subtitle><b>{{item.externeInventarNummer}}</b></v-card-subtitle>
            <v-card-subtitle>Status: <b>{{item.AbrechnungStatus}}</b></v-card-subtitle>
            <v-card-subtitle>Statusdatum: <b>{{formatDate(item.StatusDatum)}}</b></v-card-subtitle>

          </div>

        </v-col>
        <!--Artikel Details-->
        <v-col cols="12" sm="6" md="4" class="">
          <div class="d-flex align-start flex-column mt-3">
            <v-card-subtitle class="mb-1"><b>Artikeldetails:</b></v-card-subtitle>
            <v-card-subtitle>Farbe: {{item.Farbe}}</v-card-subtitle>
            <v-card-subtitle>Größe: {{item.Konfektionsgroesse}}</v-card-subtitle>
            <v-card-subtitle>Preis: {{Math.round(((item.Preis) * 100) / 100).toFixed(2).replace('.',',') }} €</v-card-subtitle>
            <v-card-subtitle>Menge: {{Math.round(((item.Menge) * 100) / 100).toFixed(0).replace('.',',') }} Stück</v-card-subtitle>
          </div>
        </v-col>
        <!--Buttons-->
        <v-col cols="12" sm="6" md="4" class="">
          <div class="d-flex flex-column align-items-center">
            <v-btn :disabled="!item.abrechenbar" class="ma-2" color="green" @click="abrechnen(item.IDinventarBuchungenPositionen, item.IDMitglied, item.AbrechnungsJahr)">Abrechnen</v-btn>
            <v-btn :disabled="!item.abrechenbar" class="mx-2 mb-2"  color="red" @click="stornieren(item.IDAbrechnung)">Stornieren</v-btn>
            <v-btn :disabled="!item.verkaufbar || !item.abrechenbar" class="mx-2 mb-2" color="secondary" @click="verkauf()">Verkauf</v-btn>
          </div>
        </v-col>
      </v-row>



    </v-card>



  </v-container>

</template>

<style scoped>

.vToolbarOben{
  background:linear-gradient(90deg,  #1A237E 15%,  #1976D2 85%);
}

.nav-icon-wrapper {
  align-items: center; /* Zentriert das Icon und das Span horizontal */
}

</style>