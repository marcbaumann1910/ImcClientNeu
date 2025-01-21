<script setup>
import { ref, onMounted, watch } from 'vue'
import { useDisplay } from "vuetify";
import AuthenticationService from "@/services/AuthenticationService.js";
import { germanColorToHex } from '@/utils/colorConverter.js'
import store from "@/store/store.js"; //Wird benötigt um Farben (text) in RGB zu wandeln

const imageUrl = process.env.VITE_API_URL
const items = ref([]);
const search = ref('');
const { smAndDown } = useDisplay();
const inputCount = ref(0);

//Abrufen der Artikel-Daten vom Server
onMounted(async () => {
  const response = await AuthenticationService.artikels(store.getters.getUserData.idVerein);
  items.value = response.data

  //Stellt sicher, dass trotz einer Navigation zur Checkout-Seite
  //die zuvor eingegeben Mengen in der Input-Box (mobile-Ansicht) wieder geladen werden
  items.value.forEach(item => {
    item.selectedQuantity = store.getters.getCartItemsCountByArtikelID(item.IDInventarArtikel);
  })
})

watch(items, (newVal, oldVal) => {

})

function handleClickUp(item) {
  item.selectedQuantity += 1;
  updateCart(item);
}


function handleClickDown(item) {
  if(item.selectedQuantity <= 1){
    return;
  }
  item.selectedQuantity -= 1;
  updateCart(item);
}

//Aktualisieren des Warenkorbs über vuex-Store
function updateCart(item){
  //Eingabe durch den Nutzer validieren und ggf. bei ungültiger Eingabe
  //auf 1 Setzen
  // Versuche, die Eingabe in eine Zahl zu konvertieren
  let parsedValue = parseInt(item.selectedQuantity);

  // Wenn die Eingabe keine gültige Zahl ist oder kleiner als 1, setze auf 1
  if (isNaN(parsedValue) || parsedValue < 1) {
    parsedValue = 1;
  } else if (parsedValue > item.Bestand) {
    // Wenn die Eingabe größer als der Bestand ist, setze auf den maximalen Bestand
    parsedValue = parseInt(item.Bestand);
  }

  // Aktualisiere selectedQuantity und inputQuantity
  item.selectedQuantity = parsedValue;

  //Auswahl wird aufbereitet und an vuex-Store übergeben
  if(item.selectedQuantity > 0) {
    const cartItem = {
      IDInventarArtikel: item.IDInventarArtikel, // Artikel-ID
      ArtikelBezeichnung: item.ArtikelBezeichnung, // Artikelbezeichnung
      Konfektionsgroesse: item.Konfektionsgroesse, // Größe
      Farbe: item.Farbe, // Farbe
      Preis: item.Preis, // Preis
      Menge: item.selectedQuantity, // Menge
      Bildpfad: item.Bildpfad,
      Bestand: item.Bestand,
      ExterneInventarNummerPflicht: item.externeInventarNummerPflicht,
      IDInventarKategorie: item.IDInventarKategorie,
      externeID: [],
    }
    //Erhöht die Anzeige im Warenkorb, wird über den vuex-Store erledigt
    //store.dispatch('setCartItemCount', cartItem.menge)
    //Fügt den ausgewählten Artikel in den vuex-Store
    store.dispatch('setCartItems', cartItem)

  }
  console.log('vuex-store cartItems', store.getters.getCartItems)
}

// Diese Funktion erstellt eine Liste von Zahlen von 1 bis zum maximalen Bestand (Bestand des Artikels)
function getAvailableQuantities(maxQuantity) {
  return Array.from({ length: maxQuantity }, (_, i) => i + 1);
}

//hier die verfügbaren props für das headers Object: https://vuetifyjs.com/en/api/v-data-table/
//Hier können die Spaltenüberschriften festgelegt (title) und die aus der Datenbankanfrage (items) die
//entsprechenden Spalten über (value) zugordnet werden.
const headers = ref([
  {
    title: 'Bild',
    value: 'Bildpfad',
    sortable: false,
    maxWidth: '60px',
    headerProps: { class: 'd-none d-sm-table-cell' }, // Nur ab sm sichtbar
    cellProps: { class: 'd-none d-sm-table-cell' }, // Nur ab sm sichtbar
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
    title: 'Lager',
    value: 'Bestand',
    sortable: true,
    align: 'start',
    headerProps: { class: 'd-none d-sm-table-cell' }, // Nur ab sm sichtbar
    cellProps: { class: 'd-none d-sm-table-cell' }, // Nur ab sm sichtbar
  },
  {
    title: 'Menge',
    value: 'Menge',
    sortable: false,
    align: 'start'
  },

]);
console.log('items: ', items);
console.log('germanColorToHex', germanColorToHex('rot'))
console.log('germanColorToHex', germanColorToHex('grün'))

</script>

<template>

  <v-row justify="center">
    <v-col cols="12" md="8" lg="8">

      <v-card class="w-100" flat>

        <v-card-title class="d-flex align-center pe-2">
          <!-- Icon und Text in einer Zeile -->
<!--          <v-icon icon="mdi-wardrobe-outline" class="mr-2"></v-icon>-->
<!--          <span class="desktop-label d-none d-sm-inline">Inventar</span>-->

          <!-- Spacer fügt Flex-Raum hinzu, damit das Suchfeld nach rechts ausgerichtet wird -->
          <v-spacer></v-spacer>

          <!-- Suchfeld -->
          <v-text-field
              v-model="search"
              class="search-field"
              density="compact"
              label="Suche"
              prepend-inner-icon="mdi-magnify"
              variant="solo-filled"
              flat
              hide-details
              single-line
          ></v-text-field>
        </v-card-title>


        <v-card  elevation="2" class="mb-1 mt-1 pt-1" flat>
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

<!--        <v-card  elevation="2" class="mx-auto pa-1" flat>-->
<!--          <v-card-subtitle>Filtern nach Größe</v-card-subtitle>-->
<!--          <v-chip-->
<!--              color="secondary"-->
<!--              class="my-3 ml-2"-->
<!--              @click="search=''"-->
<!--              prepend-icon="mdi-close-circle-outline"-->
<!--          >-->
<!--            Filter löschen-->
<!--          </v-chip>-->
<!--        </v-card>-->

        <v-divider></v-divider>
        <div style="overflow-x: auto;">
          <v-data-table
              :headers="headers"
              :items="items"
              v-model:search="search"
              items-per-page="5"
              items-per-page-text="Einträge je Seite"
              :pageText="'{0}-{1} von {2}'"

          >

            <!-- Slot für die Header der Spalte 'ArtikelBezeichnung' hier wird ein Kreis als Symbol verwendet-->
            <!--      <template #header.Farbe="{ column }">-->
            <!--        <div class="rainbow-circle"></div>-->
            <!--      </template>-->

            <!-- Spalte Farbe -->
            <!-- Steuerung der Spaltenbeschriftung. Auf kleinen mobilen Geräten werden Symbole verwendet sonst Text     -->
            <template #header.Farbe="{ column }">
              <span class="desktop-label">Farbe</span> <!-- Text auf großen Geräten -->
              <v-icon class="mobile-label">mdi-palette</v-icon> <!-- Icon auf mobilen Geräten -->
            </template>

            <!-- Zeileninhalt für 'Farbe', mit Text auf großen Geräten und farbigem Punkt auf mobilen Geräten -->
            <template #item.Farbe="{ item }">
              <span class="desktop-label">{{ item.Farbe }}</span> <!-- Text auf großen Geräten -->
              <div
                  class="color-circle mobile-label"
                  :style="{ backgroundColor: germanColorToHex(item.Farbe) }"
              ></div> <!-- Farbpunkt auf mobilen Geräten -->
            </template>

            <!-- Spalte Artikel -->
              <template #header.ArtikelBezeichnung="{ column }">
                <span class="d-none d-sm-inline">Artikel</span>
                <v-icon class="d-inline d-sm-none">mdi-tshirt-crew</v-icon>
              </template>
              <template #item.ArtikelBezeichnung="{ item }">
                <v-badge
                    :content="`${parseInt(item.Bestand)}`"
                    :color="item.Bestand>0 ? 'green' : 'red'"
                    v-if="smAndDown"
                >
                <div class="artikel-column columnArtikelBezeichnung ma-2">  {{ item.ArtikelBezeichnung }} </div>
                </v-badge>
                <div v-else class="artikel-column ma-2">  {{ item.ArtikelBezeichnung }} </div>
              </template>


            <!-- Spalte Konfektionsgroesse -->
            <template #header.Konfektionsgroesse="{ column }">
              <span class="d-none d-sm-inline">Grösse</span>
              <v-icon class="d-inline d-sm-none">mdi-ruler</v-icon>
            </template>
            <template #item.Konfektionsgroesse="{ item }">
              {{ item.Konfektionsgroesse }}
            </template>

            <!-- Spalte Preis -->
            <template #header.Preis="{ column }">
              <span class="d-none d-sm-inline">Preis</span>
              <v-icon class="d-inline d-sm-none">mdi-currency-eur</v-icon>
            </template>
            <template #item.Preis="{ item }">
              <span>{{ parseFloat(item.Preis).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €</span>
            </template>

            <!--Lager wird auf kleinen mobilen Geräten ausgeblendet, erfolgt über das Array headers[]-->
            <template #header.Bestand="{ column }">
              <span class="d-none d-sm-inline">Lager</span>
              <v-icon class="d-inline d-sm-none">mdi-warehouse</v-icon>
            </template>
            <template #item.Bestand="{ item }">
              <v-chip
                  v-if="item.Bestand > 0"
                  color="success"
              >
                {{ `${Math.floor(item.Bestand)}`}}
              </v-chip>
              <v-chip
                  v-else
                  color="error"
              >
                {{ `${Math.floor(item.Bestand)}`}}
              </v-chip>
            </template>

            <!--Bilder werden auf kleinen mobilen Geräten ausgeblendet, erfolgt über das Array headers[]-->
            <template v-slot:item.Bildpfad="{ item }">
              <v-card class="my-2" elevation="2" rounded>
                <v-img
                    :src="`${imageUrl}${item.Bildpfad}`"
                    height="64"
                    cover
                ></v-img>
              </v-card>
            </template>

            <!-- Neue Spalte mit Menge -->
            <template #header.Menge="{ column }">
              <span class="d-none d-sm-inline">Menge</span>
              <v-icon class="d-inline d-sm-none">mdi-cart</v-icon>
            </template>
            <template v-slot:item.Menge="{ item }">
              <v-row align="center">
                <v-col class="d-flex align-center" cols="12">
                 <v-select
                     v-if="!smAndDown"
                     :items="getAvailableQuantities(item.Bestand)"
                     v-model="item.selectedQuantity"
                     dense
                     variant="solo-filled"
                     hide-details
                     @update:modelValue="updateCart(item)"
                 >
                 </v-select>
                <!--Mengen Eingabe über Up and Down für mobile Geräte-->
                  <template v-if="smAndDown">
                    <div class="d-flex flex-column align-start">
                      <span>
                        <v-icon size="25" class="vLableUpDown" @click="handleClickUp(item)"
                        >mdi-chevron-up</v-icon
                        >
                      </span>
                      <input
                          type="text"
                          v-model="item.selectedQuantity"
                          class="inputCount"
                          @input="updateCart(item)"
                      /><br /><br />
                      <span>
                        <v-icon size="25" class="vLableUpDown" @click="handleClickDown(item)"
                        >mdi-chevron-down</v-icon
                        >
                      </span>
                    </div>
                  </template>
                </v-col>
              </v-row>
            </template>

            <!-- Preis mit Währungssymbol -->
            <!--      <template v-slot:item.Preis="{ item }">-->
            <!--        <span>{{ parseFloat(item.Preis).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} €</span>-->
            <!--      </template>-->
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
            <!--      <template v-slot:item.Bestand="{ item }">-->
            <!--        <div class="text-start">-->
            <!--          <v-chip-->
            <!--              v-tooltip="`Bestand ${Math.floor(item.Bestand)}`"-->
            <!--              v-if="item.Bestand > 0"-->
            <!--              color="success"-->
            <!--              class="my-3 ml-2"-->
            <!--          >-->
            <!--            {{ Math.round(item.Bestand) }} verfügbar-->
            <!--          </v-chip>-->
            <!--          <v-chip-->
            <!--              v-else-->
            <!--              color="error"-->
            <!--              class="my-3 ml-2 text-start"-->
            <!--          >-->
            <!--            {{ Math.round(item.Bestand) }} verfügbar-->
            <!--          </v-chip>-->
            <!--        </div>-->
            <!--      </template>-->
          </v-data-table>
        </div>
      </v-card>

    </v-col>
  </v-row>
</template>

<style scoped>

.rainbow-circle {
  width: 50px;
  height: 50px;
  max-width: 25px;
  max-height: 25px;
  border-radius: 50%; /* Runde Form */
  background: conic-gradient(red, orange, yellow, green, blue, indigo, violet);

}

.vLableUpDown {
  font-size: 15px;
  margin-left: -5px;
}

:hover .vLableUpDown {
  cursor: pointer;
}

.inputCount {
  font-size: 12px;
  text-align: center; /* Text innerhalb des Input-Feldes zentrieren */
  margin-left: -23%;
  margin-top: 0;
  margin-bottom: -110%;
  width: 30px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid #181818;
}

.color-circle {
  width: 18px; /* Größe des Punktes */
  height: 18px;
  border-radius: 50%; /* Runde Form */
  display: inline-block; /* Stellt den Punkt inline dar */
  border: 1px solid; /* Standard ist kein sichtbarer Rand */
}

/* Zeige diese Elemente nur auf mobilen Geräten (max-width: 600px) */
.mobile-label {
  display: none;
}

/* Zeige diese Elemente nur auf großen Geräten (größer als 600px) */
.desktop-label {
  display: inline;
}

/* Ab 600px Bildschirmbreite aufwärts */
@media (max-width: 600px) {
  .mobile-label {
    display: inline-block; /* Zeigt den Punkt auf mobilen Geräten */
  }
  .desktop-label {
    display: none; /* Versteckt den Text auf mobilen Geräten */
  }
}

/* Generelle Schriftgröße für die v-data-table */
.v-data-table {
  font-size: 16px; /* Standard-Schriftgröße */
}

/* Verkleinere die Schriftgröße auf mobilen Geräten (kleiner als 600px) */
@media (max-width: 600px) {
  .v-data-table {
    font-size: 11px; /* Kleinere Schriftgröße auf mobilen Geräten */
  }
}

/* Breite der "Artikel"-Spalte auf mobilen Geräten */
@media (max-width: 600px) {
  .artikel-column {
    max-width: 80px; /* Schmalere Breite auf mobilen Geräten */
  }
}

.columnArtikelBezeichnung{
  margin-left: -5%;
}

/* Standardbreite des Suchfelds */
.search-field {
  max-width: 300px;
  width: 100%;
}

/* Auf mobilen Geräten (kleiner als 600px) soll das Suchfeld breiter werden */
@media (max-width: 600px) {
  .search-field {
    max-width: none; /* Deaktiviert die feste Breite */
    width: 100%; /* Das Suchfeld nimmt die volle Breite des Containers ein */
  }
}

/* Zeige den Text "Inventar" nur auf größeren Geräten */
@media (max-width: 600px) {
  .desktop-label {
    display: none;
  }
}

/* Auf größeren Geräten bleibt der Text sichtbar */
@media (min-width: 600px) {
  .desktop-label {
    display: inline;
  }
}

</style>
