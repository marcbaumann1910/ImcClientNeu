<script setup>
import { ref } from 'vue'
import AuthenticationService from "@/services/AuthenticationService.js";
import { notifyError, notifySuccess } from '@/scripte/notifications.js';
import Notifications from "@/components/Notifications.vue";
import {isVisibleIventarStatus} from "@/scripte/globalFunctions.js";
const abrechnungsDaten = ref();
const abrechnungsJahr = ref();

try{
  const response = await AuthenticationService.abrechnungsDaten();
  abrechnungsDaten.value = response.data.abrechnungsDaten;
  abrechnungsJahr.value = response.data.abrechnungsJahr;
  console.log(abrechnungsJahr, abrechnungsDaten);
}catch(error){
  notifyError('Abrechnungsdaten konnten nicht abgerufen werden');
  console.log('Abrechnungsdaten konnten nicht abgerufen werden', error);
}

</script>


<template>
  <Notifications/>


  <!--Hier sollen alle Abrechnungsfähigen Artikel, zusammengefasst unter dem Mitglied aufgeführt werden  -->
  <!--Die Gesamtsumme der Abrechnungspositionen soll angezeigt werden  -->
  <!--Es soll eine Filterfunktion bzw. Auswahlfunktion nach Jahr Jahr geben, sowie eine Suchfunktion nach Mitglied  -->
  <!--Mit Klick auf das Mitglied, soll auf eine neue Seite navigiert werden, wo die Detailansicht verfügbar ist, auch in mobil  -->
  <v-container max-width="1250">
    <h1>Abrechnung</h1>

    <v-select variant="solo-filled" class="mt-3">

    </v-select>

      <v-card
          v-for="item in abrechnungsDaten"
          :key="item.id"
          class="my-2 pb-2"

      >
        <v-toolbar height="40" class="vToolbar align-center">
         <!--Title ist nur das, damit das icon rechts positioniert ist -->
          <v-toolbar-title class="ma-2 text-white">{{item.AbrechnungsJahr}}</v-toolbar-title>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                  icon="mdi-text-search"
                  variant="text"
                  v-bind="props"
                  class="text-white"
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
              <v-icon class="mr-2">mdi-cash-register</v-icon>
                {{ Math.round(((item.offenerBetrag) *100) /100).toFixed(2) }} €
            </v-card-title>
          </v-col>
          <!--Anzahl Positionen-->
          <v-col cols="12" sm="6" md="4" class="text-start">
            <v-card-title>
              <v-icon class="mr-2">mdi-counter</v-icon>
              {{item.anzahlPositionen}}
            </v-card-title>
          </v-col>
        </v-row>
      </v-card>

  </v-container>



  </template>

<style scoped>

.vToolbar{
  background:linear-gradient(90deg,  #1A237E 15%,  #1976D2 85%);
}

</style>