<script setup>
import {ref, onMounted, computed} from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";
import DialogRuecknahme from "@/components/LeihvorgangVerwalten/DialogRuecknahme.vue";
import store from "@/store/store.js";
const imageUrl = process.env.VITE_API_URL
const search = ref(null);
let leihvorgaengeMitgliederAbrufen = ref([]);

// Hier werden alle Mitglieder abgerufen
onMounted(async () => {
  try {
    const response = await AuthenticationService.leihvorgangVerwalten();
    leihvorgaengeMitgliederAbrufen.value = response.data.map(member => ({
      ...member,
      leihvorgaengeArtikelDetails: [],
      dataLoaded: false,
    }));
    console.log('leihvorgaengeMitgliederAbrufen erfolgreich', leihvorgaengeMitgliederAbrufen.value);
  } catch (error) {
    console.log('Abruf der Daten leihvorgaengeMitgliederAbrufen fehlgeschlagen', error);
  }
});


// Mit Klick auf eines der Mitglieder werden die verliehene Artikel je Mitglied abgerufen
async function expansionForLeihvorgang(member) {
  if (!member.dataLoaded) {
    try {
      const response = await AuthenticationService.leihvorgangArtikel(member.easyVereinMitglied_id);
      member.leihvorgaengeArtikelDetails = response.data;
      member.dataLoaded = true;
      //Der Gesamtpreis kommt auch über die Abfrage, wird aber in ein separates Element des Objekte member geschrieben
      member.gesamtPreis = member.leihvorgaengeArtikelDetails[0].inventarBuchungenPositionen_GesamtPreis
      member.anzahlArtikel = member.leihvorgaengeArtikelDetails[0].inventarBuchungenPositionen_Count
      console.log(`Leihvorgänge für Mitglied ${member.easyVereinMitglied_id} erfolgreich`, member.leihvorgaengeArtikelDetails);
    } catch (error) {
      console.log(`Abruf der Daten für Mitglied ${member.easyVereinMitglied_id} fehlgeschlagen`, error);
    }
  }
}

function showDialogRuecknahme(artikelDetails, member) {
  store.dispatch('setShowDialogRuecknahmeArtikel', {
    showDialog: true,
    IDinventarBuchungenPositionen: artikelDetails.inventarBuchungenPositionen_IDinventarBuchungenPositionen,
    bemerkung: '',
    artikelDetails: artikelDetails,
    artikelZustand: '',
    memberName: `${member.easyVereinMitglied_firstName} ${member.easyVereinMitglied_familyName}`

  });
  console.log('showDialogRuecknahme artikelDetails', artikelDetails)
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

    <DialogRuecknahme v-if="showDialogRuecknahme"/>

    <div>
      <v-text-field
          v-model="search"
          class="search-field mb-4"
          label="Suche Mitglieder"
          prepend-inner-icon="mdi-magnify"
          clearable
          @click:clear="search = ''"
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
      <v-expansion-panels multiple>
        <!-- Erstes Level -->
        <v-expansion-panel v-for="(item) in leihvorgaengeMitgliederAbrufen" :key="item.easyVereinMitglied_id" class="mb-1">
          <v-expansion-panel-title @click="expansionForLeihvorgang(item)">
            {{ item.easyVereinMitglied_firstName }} {{item.easyVereinMitglied_familyName}}
            <template v-slot:actions="{ expanded }">
              <v-icon :color="!expanded ? 'orange' : ''" :icon="expanded ? 'mdi-pencil' : 'mdi-progress-clock'"></v-icon>
            </template>
          </v-expansion-panel-title>
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
                      <v-list-item v-for="(itemArtikelDetails) in item.leihvorgaengeArtikelDetails" :key="item.leihvorgaengeArtikelDetails.IDinventarBuchungenPositionen" class="mb-2 mt-2">
                        <v-row no-gutters align="start" class="w-100">
                          <v-col cols="1" class="d-flex align-center" > <!-- Flexibel halten und rechten Abstand hinzufügen -->
                            <v-img
                                :src="`${imageUrl}${itemArtikelDetails.inventarArtikel_Bildpfad}`"
                                alt="Artikelbild"
                                min-height="50"
                                min-width="50"
                                max-width="70"
                                max-height="70"
                                class="mt-2"
                            ></v-img>
                          </v-col>

                          <v-col cols="2" class="mb-2">
                            <v-list-item-title>Nummer: {{ itemArtikelDetails.inventarBuchungenPositionen_externeInventarNummer }}</v-list-item-title>
                            <v-list-item-title>{{ itemArtikelDetails.inventarArtikel_ArtikelBezeichnung }}</v-list-item-title>
                            <v-list-item-subtitle>Farbe: {{ itemArtikelDetails.farbe_Bezeichnung }} </v-list-item-subtitle>
                            <v-list-item-subtitle>Größe: {{ itemArtikelDetails.konfektionsGroesse_Konfektionsgroesse }}</v-list-item-subtitle>
                            <v-list-item-subtitle>Menge: {{ itemArtikelDetails.inventarBuchungenPositionen_Menge }} Stück</v-list-item-subtitle>
                          </v-col>

                          <v-col cols="4" class="d-flex flex-column justify-end align-center align-self-stretch mb-2">

                            <v-label @click="showDialogRuecknahme(itemArtikelDetails, item)" class="hover text-subtitle-2"
                            >
                              <v-icon class="mr-1">mdi-arrow-down-thin-circle-outline</v-icon>
                              Rücknahme
                            </v-label>

                          </v-col>

                          <v-col cols="2" class="d-flex flex-column justify-end align-start align-self-stretch mb-2">
                            <v-label @click="deleteItem(itemArtikelDetails.IDInventarArtikel)" class="hover text-subtitle-2"
                            >
                              <v-icon class="mr-1">mdi-pencil-outline</v-icon>
                              Nummer ändern
                            </v-label>
                          </v-col>

                          <v-col cols="2" class="d-flex flex-column justify-end align-start align-self-stretch mb-2">
                            <v-label
                                @click="showDialogForExterneID(itemArtikelDetails.Menge, itemArtikelDetails.IDInventarArtikel)"
                                class="hover text-subtitle-2 text-blue-darken-4 mt-2"
                            >
                              <v-icon class="mr-1">mdi-sync</v-icon>
                              Artikel austauschen
                            </v-label>
                          </v-col>

                          <v-col cols="1" class="d-flex justify-end align-end">
                            <v-list-item-title>{{ Math.round(((itemArtikelDetails.inventarBuchungenPositionen_Preis) *100) /100).toFixed(2) }} €</v-list-item-title>
                          </v-col>

                          <v-divider></v-divider>

                        </v-row>
                      </v-list-item>

                      <v-row>
                        <v-col class="d-flex justify-end mr-0">
                          <v-list-item-action class="mr-2">
                            <v-list-item-title><b>Gesamtpreis: {{ (Math.round(item.gesamtPreis *100) /100).toFixed(2) }} €</b></v-list-item-title>
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