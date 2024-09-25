<template>

  <v-row justify="center">
    <v-col cols="12" md="8" lg="6">

  <v-card class="vcard" flat>
    <v-card-title class="d-flex align-center pe-2">
      <v-icon icon="mdi-hanger"></v-icon> &nbsp;
      Inventar

      <v-spacer></v-spacer>

      <v-text-field
          v-model="search"
          density="compact"
          label="Suche"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
      ></v-text-field>
    </v-card-title>
    <v-card  elevation="2" class="mb-1 mt-1" flat>
      <v-card-subtitle>Filtern nach Kategorie</v-card-subtitle>
      <v-chip
          color="secondary"
          class="my-3 ml-2"
          @click="search=''"
          prepend-icon="mdi-close-circle-outline"
      >
        Filter löschen
      </v-chip>
      <v-chip
          color="red"
          class="my-3 ml-2"
          @click="search='Rock'"
      >
        Rock
      </v-chip>
      <v-chip
          color="blue"
          class="my-3 ml-2"
          @click="search='Bluse'"
      >
        Bluse
      </v-chip>
      <v-chip
          color="grey"
          class="my-3 ml-2"
          @click="search='Unterhose'"
      >
        Unterhose
      </v-chip>
      <v-chip
          color="black"
          class="my-3 ml-2"
          @click="search='Dicker Peter'"
      >
        Dicker Peter
      </v-chip>
    </v-card>
    <v-card  elevation="2" class="mx-auto pa-1" flat>
      <v-card-subtitle>Filtern nach Größe</v-card-subtitle>
      <v-chip
          color="secondary"
          class="my-3 ml-2"
          @click="search=''"
          prepend-icon="mdi-close-circle-outline"
      >
        Filter löschen
      </v-chip>
    </v-card>
    <v-divider></v-divider>
    <div style="overflow-x: auto;">
    <v-data-table
        :headers="headers"
        :items="items"
        v-model:search="search"
        items-per-page="10"

    >

      <template v-slot:item.Bildpfad="{ item }">
        <v-card class="my-2" elevation="2" rounded>
          <v-img
              :src="`${imageUrl}${item.Bildpfad}`"
              height="64"
              cover
          ></v-img>
        </v-card>
      </template>

      <!-- Preis mit Währungssymbol -->
      <template v-slot:item.Preis="{ item }">
        {{ item.Preis }} €
      </template>
<!--Slots für weitere spalten wir auf Lager-->
<!--      <template v-slot:item.rating="{ item }">-->
<!--        <v-rating-->
<!--            :model-value="item.rating"-->
<!--            color="orange-darken-2"-->
<!--            density="compact"-->
<!--            size="small"-->
<!--            readonly-->
<!--        ></v-rating>-->
<!--      </template>-->

<!--      <template v-slot:item.Bestand="{ item }">-->
<!--        <div class="text-start">-->
<!--          <v-chip-->
<!--              :color="item.Bestand > 0 ? 'green' : 'red'"-->
<!--              :text="item.Bestand > 0 ? 'verfügbar' : 'nicht verfügbar'"-->
<!--              class="text-uppercase"-->
<!--              size="small"-->
<!--              label-->
<!--          ></v-chip>-->
<!--        </div>-->
<!--      </template>-->
      <template v-slot:item.Bestand="{ item }">
        <div class="text-start">
          <v-icon v-if="item.Bestand > 0" icon="mdi-check-bold" color="success"></v-icon>
          <v-icon v-else icon="mdi-close-circle-outline" color="error"></v-icon>
        </div>
      </template>
    </v-data-table>
    </div>
  </v-card>

  </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AuthenticationService from "@/services/AuthenticationService.js";

const imageUrl = process.env.VITE_API_URL
const items = ref([]);
const search = ref('');

//Abrufen der Artikel-Daten vom Server
onMounted(async () => {
  const response = await AuthenticationService.artikel()
  items.value = response.data
})

//hier die verfügbaren props für das headers Object: https://vuetifyjs.com/en/api/v-data-table/
//Hier können die Spaltenüberschriften festgelegt (title) und die aus der Datenbankanfrage (items) die
//entsprechenden Spalten über (value) zugordnet werden.
const headers = ref([
  {
    title: 'Bild',
    value: 'Bildpfad',
    sortable: false
  },
  {
    title: 'Artikel',
    value: 'ArtikelBezeichnung',
    sortable: true
  },
  {
    title: 'Größe',
    value: 'Konfektionsgroesse',
    sortable: true
  },
  {
    title: 'Preis',
    value: 'Preis',
    sortable: true
  },
  {
    title: 'Farbe',
    value: 'Farbe',
    sortable: true
  },
  {
    title: 'verfügbar',
    value: 'Bestand',
    sortable: true,
    align: 'start'
  },
]);

console.log('items: ', items);

</script>

<style scoped>

.vcard{
  max-width: 1400px;

}

</style>
