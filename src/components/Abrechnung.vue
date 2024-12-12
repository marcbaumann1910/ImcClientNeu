<script setup>
import { ref, onMounted } from 'vue'
import { useDisplay } from "vuetify";
import AuthenticationService from "@/services/AuthenticationService.js";
import { notifyError, notifySuccess } from '@/scripte/notifications.js';
import Notifications from "@/components/Notifications.vue";
const abrechnungsDaten = ref([]);
const abrechnungsJahr = ref([]);
const { smAndDown } = useDisplay();
const selectAbrechnungsJahr = ref();

onMounted(()=>{
  loadData()
  selectAbrechnungsJahr.value = new Date().getFullYear();
})

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
  }
  //console.log('jahr',jahr)
  const filtered =  abrechnungsJahr.value.filter(item => item.AbrechnungsJahr === jahr);

  //console.log('filtered',filtered);
  return filtered;
}

async function loadData(){
  try{
    const response = await AuthenticationService.abrechnungsDaten(selectAbrechnungsJahr.value);
    abrechnungsDaten.value = response.data.abrechnungsDaten;
    abrechnungsJahr.value = response.data.abrechnungsJahr;
    console.log(abrechnungsJahr, abrechnungsDaten);
  }catch(error){
    notifyError('Abrechnungsdaten konnten nicht abgerufen werden');
    console.log('Abrechnungsdaten konnten nicht abgerufen werden', error);
  }
}

</script>


<template>
  <Notifications/>


  <!--Hier sollen alle Abrechnungsfähigen Artikel, zusammengefasst unter dem Mitglied aufgeführt werden  -->
  <!--Die Gesamtsumme der Abrechnungspositionen soll angezeigt werden  -->
  <!--Es soll eine Filterfunktion bzw. Auswahlfunktion nach Jahr geben, sowie eine Suchfunktion nach Mitglied  -->
  <!--Mit Klick auf das Mitglied, soll auf eine neue Seite navigiert werden, wo die Detailansicht verfügbar ist, auch in mobil  -->
  <v-container max-width="1250">
    <h3 class="pa-0">Abrechnung
      {{ getAbrechnungsDaten().length > 0 ? getAbrechnungsDaten()[0].AbrechnungsJahr : '' }}
    </h3>

    <div class="mt-1">
      <v-row>
      <!--offen, nicht abgerechnete Vorgänge-->
        <v-col cols="12" sm="6" md="4" class="text-start">
          <v-card v-if="smAndDown" class="">
            <v-card-title class="text-center">
              <v-icon size="25">mdi-timer-sand</v-icon>
              {{ getAbrechnungsDaten().length > 0 ? getAbrechnungsDaten()[0].sumOffen.replace('.',',') + ' €' : '' }}
            </v-card-title>          </v-card>
          <v-card v-else min-height="57">
            <v-card-subtitle class="mt-1">offen</v-card-subtitle>
            <v-card-title>
              {{ getAbrechnungsDaten().length > 0 ? getAbrechnungsDaten()[0].sumOffen.replace('.',',') + ' €' : '' }}
            </v-card-title>
          </v-card>
        </v-col>
        <!--abgerechnete Vorgänge-->
        <v-col cols="12" sm="6" md="4" class="text-start">
          <v-card v-if="smAndDown" >
            <v-card-title class="text-center">
              <v-icon size="25">mdi-cash-check</v-icon>
              {{ getAbrechnungsDaten().length > 0 ? getAbrechnungsDaten()[0].sumAbgerechnet.replace('.',',') + ' €' : '' }}
            </v-card-title>               </v-card>
          <v-card v-else min-height="57">
            <v-card-subtitle class="mt-1">abrechnet</v-card-subtitle>
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

    <v-text-field>Suche</v-text-field>
    <!--v-cards je Mitlgied-->
      <v-card
          v-for="item in abrechnungsDaten"
          :key="item.id"
          class="mt-2 mb-2"

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
              <v-icon size="25" class="mr-1">mdi-timer-sand</v-icon>
                {{ Math.round(((item.offenerBetrag) *100) /100).toFixed(2).replace('.',',') }} €
              <v-icon size="25" class="mr-1">mdi-cash-check</v-icon>
              {{ Math.round(((item.sumAbgerechnet) *100) /100).toFixed(2).replace('.',',') }} €

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

        <v-toolbar height="40" class="mt-2">
          <!--Title ist nur das, damit das icon rechts positioniert ist -->
          <v-toolbar-title class="mt-1">{{item.AbrechnungsJahr}}</v-toolbar-title>
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
      </v-card>

  </v-container>



  </template>

<style scoped>

.vToolbar{
  background:linear-gradient(90deg,  #1A237E 15%,  #1976D2 85%);
}

.text {
  font-size: 20px; /* Standardgröße für größere Bildschirme */
}

@media (max-width: 600px) {
  .text {
    font-size: 16px; /* Verkleinerte Schriftgröße auf kleineren Bildschirmen */
  }
}

</style>