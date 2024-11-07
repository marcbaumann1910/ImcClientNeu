<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";
import DialogRuecknahme from "@/components/LeihvorgangVerwalten/DialogRuecknahme.vue";
import store from "@/store/store.js";
import { expansionForLeihvorgang } from "@/scripte/globalFunctions.js"
import DialogNummerAendern from "@/components/LeihvorgangVerwalten/DialogNummerAendern.vue";
import DialogArtikelTausch from "@/components/LeihvorgangVerwalten/DialogArtikelTausch.vue";


const imageUrl = process.env.VITE_API_URL
// Ref zur Verfolgung der erweiterten Panels
const expandedPanels = ref([]);
// Reaktives Objekt zur Verfolgung des Checkbox-Status
const checkedItems = reactive({});
const loading = ref(false);
const searchArtikels = ref({});
const searchMitglied = ref('');
const leihvorgaengeMitgliederAbrufen = ref([]);
const idInventarArtikel = ref('');
const selectedMember = ref(null);


// Hier werden alle Mitglieder abgerufen
onMounted(async () => {
  try {
    const response = await AuthenticationService.leihvorgangVerwalten();
    leihvorgaengeMitgliederAbrufen.value = response.data.map(member => reactive({
      ...member,
      leihvorgaengeArtikelDetails: [],
      dataLoaded: false,
    }));
    console.log('leihvorgaengeMitgliederAbrufen erfolgreich', leihvorgaengeMitgliederAbrufen.value);
  } catch (error) {
    console.log('Abruf der Daten leihvorgaengeMitgliederAbrufen fehlgeschlagen', error);
  }
  initializeCheckedItems(); //checkt die Checkbox ausgeliehen standardmäßig
});

// Funktion zur Initialisierung von checkedItems basierend auf leihvorgaengeMitgliederAbrufen
//Siehe ausführliche Beschreibung in der Doku
function initializeCheckedItems(){
  leihvorgaengeMitgliederAbrufen.value.forEach(item => {
    if (!(item.easyVereinMitglied_id in checkedItems)) {
      checkedItems[item.easyVereinMitglied_id] = {
        ausgeliehen: true,    // Standardmäßig gecheckt
        abgeschlossen: false // Standardmäßig nicht gecheckt
      };
      console.log(`Checkboxen für ID ${item.easyVereinMitglied_id.ausgeliehen} initialisiert`);
    }
  });
  console.log('checkedItems nach Initialisierung:', checkedItems);
}

function handleCheckboxAusgeliehen(item) {
  //Wichtig: item entspricht member und wird vollständig benötigt, um die Funktion expansionForLeihvorgang()
  //aufrufen zukönnen
  const isChecked = checkedItems[item.easyVereinMitglied_id].ausgeliehen;
  console.log(`Checkbox für ID ${item.easyVereinMitglied_id.ausgeliehen} ist jetzt ${isChecked ? 'gecheckt' : 'nicht gecheckt'}`);

  if(isChecked){
    store.dispatch('setShowAusgeliehenAbgeschlossen', {idMitglied: item.easyVereinMitglied_id, checkedStateAusgeliehen: true})
    console.log('handleCheckboxAusgeliehen gecheckt')
  } else{
    store.dispatch('setShowAusgeliehenAbgeschlossen', {idMitglied: item.easyVereinMitglied_id, checkedStateAusgeliehen: false})
    console.log('handleCheckboxAusgeliehen nicht gecheckt')
  }
  expansionForLeihvorgang(item,true)
  console.log('getShowAusgeliehenAbgeschlossen', store.getters.getShowAusgeliehenAbgeschlossen)

}

function handleCheckboxAbgeschlossen(item) {
  //Wichtig: item entspricht member und wird vollständig benötigt, um die Funktion expansionForLeihvorgang()
  //aufrufen zukönnen
  const isChecked = checkedItems[item.easyVereinMitglied_id].abgeschlossen;
  console.log(`Checkbox für ID ${item.easyVereinMitglied_id.abgeschlossen} ist jetzt ${isChecked ? 'gecheckt' : 'nicht gecheckt'}`);

  if(isChecked){
    store.dispatch('setShowAusgeliehenAbgeschlossen', {idMitglied: item.easyVereinMitglied_id, checkedStateAbgeschlossen: true})
    console.log('handleCheckboxAbgeschlossen gecheckt')
  } else{
    store.dispatch('setShowAusgeliehenAbgeschlossen', {idMitglied: item.easyVereinMitglied_id, checkedStateAbgeschlossen: false})
    console.log('handleCheckboxAbgeschlossen nicht gecheckt')
  }

  expansionForLeihvorgang(item,true)
  console.log('getShowAusgeliehenAbgeschlossen', store.getters.getShowAusgeliehenAbgeschlossen)

}

// Mit Klick auf eines der Mitglieder werden die verliehene Artikel je Mitglied abgerufen
//await expansionForLeihvorgang

function showDialogRuecknahme(artikelDetails, member) {
  selectedMember.value = member;
  store.dispatch('setShowDialogRuecknahmeArtikel', {
    showDialog: true,
    IDinventarBuchungenPositionen: artikelDetails.ibp_IDinventarBuchungenPositionen,
    bemerkung: '',
    artikelDetails: artikelDetails,
    artikelZustand: '',
    memberName: `${member.easyVereinMitglied_firstName} ${member.easyVereinMitglied_familyName}`,
    idMitglied: member.easyVereinMitglied_id
  });
  console.log('showDialogRuecknahme artikelDetails', artikelDetails)
}

function filteredArtikelDetails(item) {
  const searchTerm = searchArtikels.value[item.easyVereinMitglied_id] || '';
  const lowerSearchTerm = searchTerm.toLowerCase();

  if (!searchTerm) {
    // Wenn kein Suchbegriff eingegeben wurde, alle Artikel zurückgeben
    return item.leihvorgaengeArtikelDetails;
  }

  return item.leihvorgaengeArtikelDetails.filter((detail) => {
    const artikelBezeichnung = detail.ia_ArtikelBezeichnung.toLowerCase();
    const konfektionsGroesse = detail.konfektionsGroesse_Konfektionsgroesse.toLowerCase();
    const farbe = detail.farbe.toLowerCase();

    return (
        artikelBezeichnung.includes(lowerSearchTerm) ||
        konfektionsGroesse.includes(lowerSearchTerm) ||
        farbe.includes(lowerSearchTerm)
    );
  });
}

const filteredLeihvorgaengeMitglieder = computed(() => {
  if (!searchMitglied.value) {
    // Wenn kein Suchbegriff eingegeben wurde, gib alle Mitglieder zurück
    return leihvorgaengeMitgliederAbrufen.value;
  }
  // Ansonsten filtere die Mitglieder basierend auf dem Suchbegriff
  return leihvorgaengeMitgliederAbrufen.value.filter((item) => {
    const fullName = `${item.easyVereinMitglied_firstName} ${item.easyVereinMitglied_familyName}`.toLowerCase();
    return fullName.includes(searchMitglied.value.toLowerCase());
  });
});

function formatDate(dateString) {
  if (!dateString) return '';
  const options = {day: '2-digit', month: '2-digit', year: 'numeric'};
  return new Date(dateString).toLocaleDateString('de-DE', options);
}

function isVisibleIventarStatus(status) {
  //Prüft den itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus Status
  //Wenn 1 (ausgeliehen) Element anzeigen, sonst nicht
  //Status 7 = ausgeliehen Tausch
  if(status === 1 || status === 7){
    return true
  }
  else{
    false
  }
}

function showDialogNummerAendern(item, member){
  selectedMember.value = member;
  store.dispatch('setShowDialogNummerAendern', {
    showDialog: true,
    idInventarArtikel: item,
  })
}

function showDialogArtikelTausch(item, member){
  selectedMember.value = member;
  store.dispatch('setShowDialogArtikelTausch', {
    showDialog: true,
    artikelDetails: item,
  })
}

</script>

<template>
  <v-container fluid>
    <!-- Überschrift -->
    <v-card class="mb-4">
      <v-card-text class="text-center">
        <v-card-title>Hier können Sie die Leihvorgänge verwalten</v-card-title>
      </v-card-text>
    </v-card>

    <!-- Suchfeld für Mitglieder -->
    <v-text-field
        v-model="searchMitglied"
        class="mb-4 search-field"
        label="Suche Mitglieder"
        prepend-inner-icon="mdi-magnify"
        clearable
        @click:clear=""
        variant="solo-filled"
        hide-details
        single-line
    ></v-text-field>

    <!-- Expansion Panels -->
    <v-expansion-panels v-model="expandedPanels" multiple>
      <!-- Erstes Level -->
      <v-expansion-panel
          v-for="(item) in filteredLeihvorgaengeMitglieder"
          :key="item.easyVereinMitglied_id"
          :value="item.easyVereinMitglied_id"
          class="mb-2"
      >
        <!-- Panel Titel -->
        <v-expansion-panel-title
            @click="expansionForLeihvorgang(item)"
            v-slot="{ expanded }"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              {{ item.easyVereinMitglied_firstName }} {{ item.easyVereinMitglied_familyName }}
            </div>
            <v-icon :color="expanded ? 'primary' : 'grey'">
              {{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </div>
        </v-expansion-panel-title>

        <!-- Panel Inhalt -->
        <v-expansion-panel-text>
          <!-- Filter und Suchfeld -->
          <v-row class="mb-4">
            <v-col cols="12" sm="6" class="d-flex align-center">
              <v-row>
                <v-col class="d-flex flex-column align-center">
                  <v-checkbox
                      color="orange"
                      hide-details
                      v-model="checkedItems[item.easyVereinMitglied_id].ausgeliehen"
                      @change="handleCheckboxAusgeliehen(item)"
                      class="ma-0 pa-0"
                      false-value="ausgeliehen"
                  ></v-checkbox>
                  <span class="text-center">Ausgeliehen</span>
                </v-col>
                <v-col class="d-flex flex-column align-center">
                  <v-checkbox
                      color="green"
                      hide-details
                      v-model="checkedItems[item.easyVereinMitglied_id].abgeschlossen"
                      @change="handleCheckboxAbgeschlossen(item)"
                      class="ma-0 pa-0"
                      false-value="abgeschlossen"
                  ></v-checkbox>
                  <span class="text-center">Abgeschlossen</span>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                  v-model="searchArtikels[item.easyVereinMitglied_id]"
                  :loading="loading"
                  append-inner-icon="mdi-magnify"
                  density="compact"
                  label="Artikel suchen"
                  variant="solo"
                  single-line
                  class="mt-0"
                  clearable
                  hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Artikelliste -->
          <v-list>
            <!-- Überschriften -->
            <v-list-item>
              <v-row class="w-100">
                <v-col cols="6">
                  <v-list-item-title>Artikel ({{ item.anzahlArtikel }})</v-list-item-title>
                </v-col>
                <v-col cols="6" class="text-right">
                  <v-list-item-title>Preis</v-list-item-title>
                </v-col>
              </v-row>
            </v-list-item>
            <v-divider></v-divider>

            <!-- Artikel Details -->
            <v-list-item
                v-for="(itemArtikelDetails) in filteredArtikelDetails(item)"
                :key="itemArtikelDetails.IDinventarBuchungenPositionen"
                class="mb-2 mt-2"
            >
              <v-row no-gutters align="start" class="w-100">
                <!-- Icon und Bild -->
                <v-col cols="2" sm="1" class="d-flex flex-column align-center">
                  <v-icon
                      :color="isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus) ? 'orange' : 'green'"
                  >
                    {{
                      isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus)
                          ? 'mdi-share'
                          : 'mdi-lock'
                    }}
                  </v-icon>
                  <v-img
                      :src="`${imageUrl}${itemArtikelDetails.ia_Bildpfad}`"
                      alt="Artikelbild"
                      max-width="60"
                      max-height="60"
                      class="mt-2 mb-2"
                  ></v-img>
                </v-col>

                <!-- Artikelinformationen -->
                <v-col cols="10" sm="5" class="mb-2">
                  <v-list-item-title>{{ itemArtikelDetails.ia_ArtikelBezeichnung }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Nummer: {{ itemArtikelDetails.ibp_externeInventarNummer }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>Farbe: {{ itemArtikelDetails.farbe }}</v-list-item-subtitle>
                  <v-list-item-subtitle>
                    Größe: {{ itemArtikelDetails.konfektionsGroesse_Konfektionsgroesse }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>Menge: {{ itemArtikelDetails.ibp_Menge }} Stück</v-list-item-subtitle>
                  <v-list-item-subtitle>Status: {{ itemArtikelDetails.ibp_Bezeichnung }}</v-list-item-subtitle>
                  <v-list-item-subtitle>Datum: {{ formatDate(itemArtikelDetails.ibp_StatusDatum) }}</v-list-item-subtitle>
                </v-col>

                <!-- Zustand und Bemerkung -->
                <v-col cols="12" sm="6" class="d-flex flex-column mb-2">
                  <div v-if="!isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus)">
                    <v-label class="mb-2">
                      Zustand bei Rücknahme: {{ itemArtikelDetails.iz_Bezeichnung }}
                    </v-label>
                    <v-label class="mb-2">Bemerkung: {{ itemArtikelDetails.ibp_Bemerkung }}</v-label>
                  </div>

                  <!-- Aktionen -->
                  <div v-else class="d-flex flex-wrap">
                    <v-label
                        @click="showDialogRuecknahme(itemArtikelDetails, item)"
                        class="hover text-subtitle-2 mr-4 mb-2"
                    >
                      <v-icon class="mr-1">mdi-arrow-down-thin-circle-outline</v-icon> Rücknahme
                    </v-label>
                    <v-label
                        @click="showDialogNummerAendern(itemArtikelDetails.ibp_IDinventarBuchungenPositionen, item)"
                        class="hover text-subtitle-2 mr-4 mb-2"
                    >
                      <v-icon class="mr-1">mdi-pencil-outline</v-icon> Nummer ändern
                    </v-label>
                    <v-label
                        @click="showDialogArtikelTausch(itemArtikelDetails, item)"
                        class="hover text-subtitle-2 text-blue-darken-4 mb-2"
                    >
                      <v-icon class="mr-1">mdi-sync</v-icon> Artikel austauschen
                    </v-label>
                  </div>
                </v-col>

                <!-- Preis -->
                <v-col cols="12" class="text-right">
                  <v-list-item-title>
                    {{ (Math.round(itemArtikelDetails.ibp_Preis * 100) / 100).toFixed(2) }} €
                  </v-list-item-title>
                </v-col>
              </v-row>
              <v-divider></v-divider>
            </v-list-item>

            <!-- Gesamtpreis -->
            <v-list-item>
              <v-row class="w-100">
                <v-col cols="12" class="text-right">
                  <v-list-item-title>
                    <b>Gesamtpreis: {{ (Math.round(item.gesamtPreis * 100) / 100).toFixed(2) }} €</b>
                  </v-list-item-title>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Dialoge -->
    <DialogRuecknahme v-if="showDialogRuecknahme" :member="selectedMember" />
    <DialogNummerAendern :member="selectedMember" />
    <DialogArtikelTausch :member="selectedMember" />
  </v-container>
</template>


<style scoped>

</style>