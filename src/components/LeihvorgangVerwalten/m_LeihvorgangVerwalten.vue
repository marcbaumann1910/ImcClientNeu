<script setup>
import {ref, computed, onMounted, watch} from 'vue'
const imageUrl = process.env.VITE_API_URL
import { useLeihvorgangVerwalten } from '@/composables/useLeihvorgangVerwalten.js';
import DialogRuecknahme from "@/components/LeihvorgangVerwalten/DialogRuecknahme.vue";
import DialogNummerAendern from "@/components/LeihvorgangVerwalten/DialogNummerAendern.vue";
import DialogArtikelTausch from "@/components/LeihvorgangVerwalten/DialogArtikelTausch.vue";
import { expansionForLeihvorgang, formatDate } from "@/scripte/globalFunctions.js";
import store from "@/store/store.js";
import cloneDeep from 'lodash/cloneDeep'; // Importiere cloneDeep für tiefe Kopien

const artikelDetails = ref(null);
const checkedAusgeliehen = ref(true);
const checkedAbgeschlossen = ref(false);

//Holt das member Object aus dem vuex-Store
const member = computed(() => store.getters.getMember);
// Lokale Kopie des Mitglieds (initialisiert mit einer tiefen Kopie aus dem Store)
const localMember = ref(cloneDeep(member.value));

// Watcher, um die lokale Kopie zu aktualisieren, wenn der Store sich ändert
watch(member, (newVal) => {
  if (newVal) {
    localMember.value = cloneDeep(newVal);
    artikelDetails.value = newVal.leihvorgaengeArtikelDetails;
  }
});


onMounted(async () => {

  // Erweiterung der Leihvorgänge
  const updatedMember = await expansionForLeihvorgang(localMember.value, true);
  if (updatedMember) {
    store.dispatch('setMember', updatedMember);
    localMember.value = cloneDeep(updatedMember);
    artikelDetails.value = updatedMember.leihvorgaengeArtikelDetails;
  }

  console.log('member nach expansionForLeihvorgang:', localMember.value);
});


// const artikelDetails = member.value.leihvorgaengeArtikelDetails
// Finde das Mitglied mit der übergebenen ID

// Verwende die Funktion `filteredArtikelDetails` mit dem gefundenen Mitglied
const gefilterteArtikelDetails = computed(() => {
  if (member.value && member.value.leihvorgaengeArtikelDetails) {
    return member.value.leihvorgaengeArtikelDetails;
  } else {
    return [];
  }
});

const kebabs = [
  { title: 'Rücknahme', action: 'ruecknahme', icon: 'mdi-arrow-down-thin-circle-outline' },
  { title: 'Nummer ändern', action: 'nummerAendern', icon: 'mdi-pencil' },
  { title: 'Tausch', action: 'tausch', icon: 'mdi-swap-horizontal' },
];

//Da ich in der Desktop-Ansicht mit checkboxen arbeite, übernehme ich die Logik über den vuex-Store auch in
//mobilen Ansicht. Allerdings sind es hier keine Checkboxen, sondern Chips, weshalb ich den Zustand geklickt oder nicht
//zwischenspeicher
//!!!Die Funktion expansionForLeihvorgang() in globalFunction greift auf den vuex-Store zu und holt sich dort die Informationen
//zum 'checked' Status
async function handleCheckboxAusgeliehen(){
  checkedAusgeliehen.value = !checkedAusgeliehen.value;
  await store.dispatch('setShowAusgeliehenAbgeschlossen', {idMitglied: localMember.value.easyVereinMitglied_id, checkedStateAusgeliehen: checkedAusgeliehen.value})
  console.log('checkedAusgeliehen',checkedAusgeliehen.value)
  const updatedMember = await expansionForLeihvorgang(localMember.value, true);
  if (updatedMember) {
    await store.dispatch('setMember', updatedMember);
    localMember.value = cloneDeep(updatedMember);
    artikelDetails.value = updatedMember.leihvorgaengeArtikelDetails;
  }


}
//Da ich in der Desktop-Ansicht mit checkboxen arbeite, übernehme ich die Logik über den vuex-Store auch in
//mobilen Ansicht. Allerdings sind es hier keine Checkboxen, sondern Chips, weshalb ich den Zustand geklickt oder nicht
//zwischenspeicher
async function handleCheckboxAbgeschlossen(){
  checkedAbgeschlossen.value = !checkedAbgeschlossen.value;
  await store.dispatch('setShowAusgeliehenAbgeschlossen', {idMitglied: localMember.value.easyVereinMitglied_id, checkedStateAbgeschlossen: checkedAbgeschlossen.value})
  console.log('checkedAbgeschlossen',checkedAbgeschlossen.value)
  const updatedMember = await expansionForLeihvorgang(localMember.value, true);
  if (updatedMember) {
    await store.dispatch('setMember', updatedMember);
    localMember.value = cloneDeep(updatedMember);
    artikelDetails.value = updatedMember.leihvorgaengeArtikelDetails;
  }
}

</script>


<template>
  <!-- Suchfeld -->
  <v-row>
    <v-col class="d-flex justify-end">
      <span class="ml-2"><b>{{localMember.easyVereinMitglied_firstName}} {{localMember.easyVereinMitglied_familyName}}</b></span>
      <v-spacer></v-spacer>
    <v-btn class="mb-3 mr-4" icon="mdi-close" max-height="10" max-width="10" color="transparent"></v-btn>
    </v-col>
  </v-row>


  <v-text-field
      append-inner-icon="mdi-magnify"
      density="compact"
      label="Search templates"
      variant="solo"
      hide-details
      single-line
      max-width="400"
      class="ma-2"
  ></v-text-field>

  <span class="ml-2">Filter:</span>

  <v-row></v-row>

  <v-chip class="ml-2 mt-6" color="orange"  @click="handleCheckboxAusgeliehen()">
    <b> ausgeliehen </b>
  </v-chip>

  <v-chip class="ml-2 mt-6" color="green" @click="handleCheckboxAbgeschlossen()">
    <b> abgeschlossen </b>
  </v-chip>

  <!-- Artikelkarte -->
  <v-card
      v-for="itemArtikelDetails in artikelDetails"
      :key="itemArtikelDetails"
      class="ma-2"
      max-height="250">
    <!-- Toolbar mit reduzierter Höhe -->
    <v-toolbar color="#C62828" dark height="40" class="align-center">
      <v-toolbar-title class="ml-2">{{itemArtikelDetails.ia_ArtikelBezeichnung}}</v-toolbar-title>
      <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
      </template>

      <v-list>
        <v-list-item v-for="kebab in kebabs" :key="kebab.title" @click="navigate(kebab.route)">
          <v-list-item-title>
            <v-icon left class="mr-2" >{{ kebab.icon }}</v-icon>
            {{ kebab.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
      </v-menu>
    </v-toolbar>

    <!-- Restlicher Inhalt -->
    <v-row>
      <v-col cols="3">
        <v-avatar size="36px" class="ml-2 mt-2">
          <v-img
              alt="Avatar"
              :src="`${imageUrl}${itemArtikelDetails.ia_Bildpfad}`"
          ></v-img>
        </v-avatar>
      </v-col>

      <v-col>
        <v-card-title>
          {{itemArtikelDetails.ibp_externeInventarNummer}}
        </v-card-title>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <!-- Artikelbeschreibungen untereinander -->
      <v-col cols="7" class="pa-0">
        <v-card-subtitle class="py-1 my-0 text-caption"
        >
          <v-icon color="green">mdi-check-circle</v-icon>
          {{itemArtikelDetails.ibp_Bezeichnung}}
        </v-card-subtitle
        >
        <v-card-subtitle class="py-1 my-0 text-caption"
        >
          <v-icon color="black">mdi-calendar-clock</v-icon>
          {{ formatDate(itemArtikelDetails.ibp_StatusDatum) }}
        </v-card-subtitle>
        <v-card-subtitle
            class="py-1 my-0 text-caption"
        >
          <v-icon color="black">mdi-palette</v-icon>
          {{ itemArtikelDetails.farbe }}
        </v-card-subtitle>
      </v-col>
      <v-col cols="5" class="pa-0">
        <v-card-subtitle
            class="py-1 my-0 text-caption"
        >
          <v-icon color="black" class="ml-2">mdi-currency-eur</v-icon>
          {{ Math.round(((itemArtikelDetails.ibp_Preis) * 100) / 100).toFixed(2) }} €

        </v-card-subtitle>
        <v-card-subtitle
            class="py-1 my-0 text-caption"
        >
           <v-icon color="black" class="ml-2">mdi-ruler</v-icon>
          {{itemArtikelDetails.konfektionsGroesse_Konfektionsgroesse}}
        </v-card-subtitle>
        <v-card-subtitle
            class="py-1 my-0 text-caption"
        >
          <v-icon color="black" class="ml-2">mdi-cart</v-icon>
          {{itemArtikelDetails.ibp_Menge}}
        </v-card-subtitle>
      </v-col>
    </v-row>
  </v-card>

  <!-- Aktionsbuttons -->
<!--  <v-btn class="ml-4" min-width="335">Rücknahme</v-btn>-->
<!--  <v-btn class="mx-4 my-2" min-width="335">Nummer ändern</v-btn>-->
<!--  <v-btn class="mx-4" min-width="335">Artikeltausch</v-btn>-->
</template>



<style scoped>

</style>
