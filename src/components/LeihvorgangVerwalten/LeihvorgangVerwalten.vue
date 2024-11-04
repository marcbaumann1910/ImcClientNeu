<script setup>
import {onMounted, reactive, ref} from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";
import DialogRuecknahme from "@/components/LeihvorgangVerwalten/DialogRuecknahme.vue";
import store from "@/store/store.js";
import { expansionForLeihvorgang } from "@/scripte/globalFunctions.js"


const imageUrl = process.env.VITE_API_URL
// Ref zur Verfolgung der erweiterten Panels
const expandedPanels = ref([]);
// Reaktives Objekt zur Verfolgung des Checkbox-Status
const checkedItems = reactive({});
const loading = ref(false);
const searchArtikels = ref({});
const searchMitglied = ref({})
const leihvorgaengeMitgliederAbrufen = ref([]);

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

function formatDate(dateString) {
  if (!dateString) return '';
  const options = {day: '2-digit', month: '2-digit', year: 'numeric'};
  return new Date(dateString).toLocaleDateString('de-DE', options);
}

function isVisibleIventarStatus(status) {
  //Prüft den itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus Status
  //Wenn 1 (ausgeliehen) Element anzeigen, sonst nicht
  return status === 1;
}

</script>

<template>

  <v-container>
    <div>
      <v-card class="d-flex justify-center mb-10">
        <v-card-item>
          <v-card-title>Hier können Sie die Leihvorgänge verwalten</v-card-title>
        </v-card-item>
      </v-card>
    </div>

    <DialogRuecknahme v-if="showDialogRuecknahme" :member="selectedMember" />

    <div>
      <v-text-field
          v-model="searchMitglied"
          class="search-field mb-4"
          label="Suche Mitglieder"
          prepend-inner-icon="mdi-magnify"
          clearable
          @click:clear=""
          variant="solo-filled"
          hide-details
          single-line
      ></v-text-field>
    </div>

    <div>
      <v-card class="mb-10 d-flex align-center">
        <v-card-title>Filter:</v-card-title>
        <v-chip color="orange" outlined text="offene Vorgänge" class="mr-3"></v-chip>
        <v-chip color="green" outlined text="abgeschlossen Vorgänge"></v-chip>
      </v-card>
    </div>


    <div>
      <v-expansion-panels v-model="expandedPanels" multiple>
        <!-- Erstes Level -->
        <v-expansion-panel
            v-for="(item) in leihvorgaengeMitgliederAbrufen"
            :key="item.easyVereinMitglied_id"
            :value="item.easyVereinMitglied_id"
            class="mb-1">
          <v-expansion-panel-title @click="expansionForLeihvorgang(item)">
            {{ item.easyVereinMitglied_firstName }} {{ item.easyVereinMitglied_familyName }}
            <template v-slot:actions="{ expanded }">
              <v-icon :color="!expanded ? 'orange' : ''"
                      :icon="expanded ? 'mdi-pencil' : 'mdi-progress-clock'"></v-icon>
            </template>
          </v-expansion-panel-title>
          <v-divider></v-divider>
          <div class="d-flex justify-start">
            <!-- Checkbox wird nur angezeigt, wenn das Panel erweitert ist -->
            <!-- Siehe ausführliche Beschreibung in der Doku -->
            <v-checkbox
                class="ml-3 mt-3"
                color="orange"
                label="ausgeliehen"
                hide-details
                v-model="checkedItems[item.easyVereinMitglied_id].ausgeliehen"
                @change="handleCheckboxAusgeliehen(item)"
                v-if="expandedPanels.includes(item.easyVereinMitglied_id)"
            ></v-checkbox>
            <v-checkbox
                class="mt-3"
                color="green"
                label="abgeschlossen"
                hide-details
                v-model="checkedItems[item.easyVereinMitglied_id].abgeschlossen"
                @change="handleCheckboxAbgeschlossen(item)"
                v-if="expandedPanels.includes(item.easyVereinMitglied_id)"
            ></v-checkbox>
            <v-spacer></v-spacer>
            <v-text-field
                v-model="searchArtikels[item.easyVereinMitglied_id]"
                :loading="loading"
                append-inner-icon="mdi-magnify"
                density="compact"
                label="Artikel suchen"
                variant="solo"
                single-line
                class="mt-6"
                clearable
                v-if="expandedPanels.includes(item.easyVereinMitglied_id)"
            ></v-text-field>

            <v-spacer></v-spacer>
          </div>


          <v-divider></v-divider>
          <v-expansion-panel-text>
            <!-- ###################### Details ############################## -->
            <div>
              <v-list>
                <v-row>
                  <v-col>
                    <v-list-item-action class="ml-4">
                      <v-list-item-title>Artikel {{ item.anzahlArtikel }} Stück</v-list-item-title>
                    </v-list-item-action>
                  </v-col>

                  <v-list-item-action class="mr-7">
                    <v-list-item-title>Preis</v-list-item-title>
                  </v-list-item-action>

                </v-row>
                <v-divider></v-divider>
                <v-list-item
                    v-for="(itemArtikelDetails) in filteredArtikelDetails(item)"
                    :key="itemArtikelDetails.IDinventarBuchungenPositionen"
                    class="mb-2 mt-2">
                  <v-row no-gutters align="start" class="w-100">
                    <v-col cols="1" class="d-flex flex-column justify-center align-start align-self-stretch">
                      <!-- Flexibel halten und rechten Abstand hinzufügen -->
                      <v-icon
                          class="ml-6"
                          :color="isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus) ? 'orange' : 'green'"
                      >
                        {{
                          isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus) ? 'mdi-share' : 'mdi-lock'
                        }}
                      </v-icon>
                      <v-img
                          :src="`${imageUrl}${itemArtikelDetails.ia_Bildpfad}`"
                          alt="Artikelbild"
                          min-height="70"
                          min-width="70"
                          max-width="70"
                          max-height="70"
                          class="mt-2 mb-4 ml-1"
                      ></v-img>
                    </v-col>

                    <v-col cols="3" class="mb-2">
                      <v-list-item-title>{{ itemArtikelDetails.ia_ArtikelBezeichnung }}</v-list-item-title>
                      <v-list-item-title>Nummer: {{ itemArtikelDetails.ibp_externeInventarNummer }}</v-list-item-title>
                      <v-list-item-subtitle>Farbe: {{ itemArtikelDetails.farbe }}</v-list-item-subtitle>
                      <v-list-item-subtitle>Größe: {{
                          itemArtikelDetails.konfektionsGroesse_Konfektionsgroesse
                        }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle>Menge: {{ itemArtikelDetails.ibp_Menge }} Stück</v-list-item-subtitle>
                      <v-list-item-subtitle>
                        Status: {{ itemArtikelDetails.ibp_Bezeichnung }}

                      </v-list-item-subtitle>
                      <v-list-item-subtitle>Datum: {{
                          formatDate(itemArtikelDetails.ibp_StatusDatum)
                        }}
                      </v-list-item-subtitle>


                    </v-col>

                    <v-col cols="2" class="d-flex flex-column justify-end align-start align-self-stretch mb-2">

                      <v-label
                          class="mb-6"
                          v-if="!isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus)"
                      >
                        Zustand bei Rücknahme: {{ itemArtikelDetails.iz_Bezeichnung }}
                      </v-label>

                      <v-label
                          class="mb-6"
                          v-if="!isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus)"
                      >
                        Bemerkung: {{ itemArtikelDetails.ibp_Bemerkung }}
                      </v-label>

                      <v-label
                          @click="showDialogRuecknahme(itemArtikelDetails, item)"
                          class="hover text-subtitle-2"
                          v-if="isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus)"
                      >
                        <v-icon class="mr-1">mdi-arrow-down-thin-circle-outline</v-icon>
                        Rücknahme
                      </v-label>

                    </v-col>

                    <v-col cols="2" class="d-flex flex-column justify-end align-start align-self-stretch mb-2">
                      <v-label
                          @click="deleteItem(itemArtikelDetails.IDInventarArtikel)"
                          class="hover text-subtitle-2"
                          v-if="isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus)"
                      >
                        <v-icon class="mr-1">mdi-pencil-outline</v-icon>
                        Nummer ändern
                      </v-label>
                    </v-col>

                    <v-col cols="2" class="d-flex flex-column justify-end align-start align-self-stretch mb-2">
                      <v-label
                          @click="showDialogForExterneID(itemArtikelDetails.Menge, itemArtikelDetails.IDInventarArtikel)"
                          class="hover text-subtitle-2 text-blue-darken-4 mt-2"
                          v-if="isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus)"
                      >
                        <v-icon class="mr-1">mdi-sync</v-icon>
                        Artikel austauschen
                      </v-label>
                    </v-col>

                    <v-col cols="2" class="d-flex justify-end align-end">
                      <v-list-item-title>{{ Math.round(((itemArtikelDetails.ibp_Preis) * 100) / 100).toFixed(2) }} €
                      </v-list-item-title>
                    </v-col>

                    <v-divider></v-divider>

                  </v-row>
                </v-list-item>

                <v-row>
                  <v-col class="d-flex justify-end mr-0">
                    <v-list-item-action class="mr-2">
                      <v-list-item-title><b>Gesamtpreis: {{ (Math.round(item.gesamtPreis * 100) / 100).toFixed(2) }}
                        €</b></v-list-item-title>
                    </v-list-item-action>
                  </v-col>

                </v-row>
              </v-list>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </v-container>
</template>

<style scoped>

</style>