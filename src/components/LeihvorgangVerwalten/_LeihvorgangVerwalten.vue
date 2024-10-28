<script setup>
import { ref, onMounted } from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";

let leihvorgaengeMitgliederAbrufen = ref([]);

// Hier werden alle Mitglieder abgerufen
onMounted(async () => {
  try {
    const response = await AuthenticationService.leihvorgangVerwalten();
    leihvorgaengeMitgliederAbrufen.value = response.data.map(member => ({
      ...member,
      leihvorgaengeBuchungen: [],
      dataLoaded: false,
    }));
    console.log('leihvorgaengeMitgliederAbrufen erfolgreich', leihvorgaengeMitgliederAbrufen.value);
  } catch (error) {
    console.log('Abruf der Daten leihvorgaengeMitgliederAbrufen fehlgeschlagen', error);
  }
});

// Mit Klick auf eines der Mitglieder werden die Leihvorgänge abgerufen
async function expansionForLeihvorgang(member) {
  if (!member.dataLoaded) {
    try {
      const response = await AuthenticationService.leihvorgangBuchungen(member.easyVereinMitglied_id);
      member.leihvorgaengeBuchungen = response.data;
      member.dataLoaded = true;
      console.log(`Leihvorgänge für Mitglied ${member.easyVereinMitglied_id} erfolgreich`, member.leihvorgaengeBuchungen);
    } catch (error) {
      console.log(`Abruf der Daten für Mitglied ${member.easyVereinMitglied_id} fehlgeschlagen`, error);
    }
  }
}


const testItemsLadeMitglied = [
  {
    easyVereinMitglied_firstName: 'Marc',
    easyVereinMitglied_familyName: 'Baumann',
    easyVereinMitglied_id: 12345,
    inventarBuchung_IDInventarBuchungen: [128,129],
    inventarBuchung_DatumBuchung: '01.08.2024',
    inventarBuchung_AusgeliehenBis: '',
    inventarBuchung_abgeschlossen: 'false',
  },
  {
    easyVereinMitglied_firstName: 'Heike',
    easyVereinMitglied_familyName: 'Baumann',
    easyVereinMitglied_id: 56789,
    inventarBuchung_IDInventarBuchungen: [130,131],
    inventarBuchung_DatumBuchung: '01.09.2024',
    inventarBuchung_AusgeliehenBis: '',
    inventarBuchung_abgeschlossen: 'false',
  },
  {
    easyVereinMitglied_firstName: 'Daniela',
    easyVereinMitglied_familyName: 'Teufel',
    easyVereinMitglied_id: 98765,
    inventarBuchung_IDInventarBuchungen: [132],
    inventarBuchung_DatumBuchung: '19.10.2024',
    inventarBuchung_AusgeliehenBis: '',
    inventarBuchung_abgeschlossen: 'false',
  }

]
const testItemsLadeInventarBuchungen = [
  {
    inventarBuchung_IDInventarBuchungen: 128,
    inventarBuchung_IDBenutzer: '5',
    benutzer_Vorname: 'Marc',
    benutzer_Nachname: 'Baumann',
    inventarBuchung_AusgeliehenBis: '',
    inventarBuchung_abgeschlossen: 'false',
  },
  {
    inventarBuchung_IDInventarBuchungen: 129,
    inventarBuchung_IDBenutzer: '6',
    benutzer_Vorname: 'Philipp',
    benutzer_Nachname: 'Lacker',
    inventarBuchung_AusgeliehenBis: '11.11.2024',
    inventarBuchung_abgeschlossen: 'false',
  }
]
const testItemsLadeArtikelDetails = [
  {
    Menge: '1',
    inventarBuchungenPositionen_IDinventarBuchungenPositionen: '154',
    inventarArtikel_IDInventarArtikel: 'Rock',
    inventarBuchungenPositionen_Preis: 7,
    lager_Bestand: 5,
    inventarBuchungenPositionen_externeInventarNummer: 'Rock-11',
    inventarArtikel_Farbe: 'rot',
    inventarArtikel_Konfektionsgroesse: 'XL',
    inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
  }
]

//Entwurf alle Daten abrufen!
const testItemsAll = [
  {
    easyVereinMitglied_firstName: 'Marc',
    easyVereinMitglied_lastName: 'Baumann',
    easyVereinMitglied_id: 12345,
    inventarBuchung:[
      {
        inventarBuchung_IDInventarBuchungen: 128,
        inventarBuchung_DatumBuchung: '01.08.2024',
        inventarBuchung_IDBenutzer: '5',
        benutzer_Vorname: 'Marc',
        benutzer_Nachname: 'Baumann',
        inventarBuchung_AusgeliehenBis: '',
        inventarBuchung_abgeschlossen: 'false',
        artikel: [
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '154',
            inventarArtikel_IDInventarArtikel: 'Rock',
            inventarBuchungenPositionen_Preis: 7,
            lager_Bestand: 5,
            inventarBuchungenPositionen_externeInventarNummer: 'Rock-11',
            inventarArtikel_Farbe: 'rot',
            inventarArtikel_Konfektionsgroesse: 'XL',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '137',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 2,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-8',
            inventarArtikel_Farbe: 'schwarz',
            inventarArtikel_Konfektionsgroesse: 'L',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '111',
            inventarArtikel_IDInventarArtikel: 'Hexen-Peter',
            inventarArtikel_Preis: 10,
            lager_Bestand: 1,
            inventarBuchungenPositionen_externeInventarNummer: 'Hexen-Peter-01',
            inventarArtikel_Farbe: 'schwarz',
            inventarArtikel_Konfektionsgroesse: 'S',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '99',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 8,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-11',
            inventarArtikel_Farbe: 'blau',
            inventarArtikel_Konfektionsgroesse: 'M',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          }
        ],
      },
      {
        inventarBuchung_IDInventarBuchungen: 153,
        inventarBuchung_DatumBuchung: '01.08.2024',
        inventarBuchung_IDBenutzer: '6',
        benutzer_Vorname: 'Isabella',
        benutzer_Nachname: 'Mülle',
        inventarBuchung_AusgeliehenBis: '',
        inventarBuchung_abgeschlossen: 'false',
        artikel: [
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '99',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 8,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-11',
            inventarArtikel_Farbe: 'blau',
            inventarArtikel_Konfektionsgroesse: 'M',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '137',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 2,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-8',
            inventarArtikel_Farbe: 'schwarz',
            inventarArtikel_Konfektionsgroesse: 'L',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
        ],
      }
    ],
  },
  {
    easyVereinMitglied_firstName: 'Heike',
    easyVereinMitglied_lastName: 'Baumann',
    easyVereinMitglied_id: 546578,
    inventarBuchung:[
      {
        inventarBuchung_IDInventarBuchungen: 111,
        inventarBuchung_DatumBuchung: '01.09.2024',
        inventarBuchung_IDBenutzer: '5',
        benutzer_Vorname: 'Isabella',
        benutzer_Nachname: 'Müll',
        inventarBuchung_AusgeliehenBis: '',
        inventarBuchung_abgeschlossen: 'false',
        artikel: [
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '154',
            inventarArtikel_IDInventarArtikel: 'Rock',
            inventarBuchungenPositionen_Preis: 7,
            lager_Bestand: 5,
            inventarBuchungenPositionen_externeInventarNummer: 'Rock-11',
            inventarArtikel_Farbe: 'rot',
            inventarArtikel_Konfektionsgroesse: 'XL',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '137',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 2,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-8',
            inventarArtikel_Farbe: 'schwarz',
            inventarArtikel_Konfektionsgroesse: 'L',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '111',
            inventarArtikel_IDInventarArtikel: 'Hexen-Peter',
            inventarArtikel_Preis: 10,
            lager_Bestand: 1,
            inventarBuchungenPositionen_externeInventarNummer: 'Hexen-Peter-01',
            inventarArtikel_Farbe: 'schwarz',
            inventarArtikel_Konfektionsgroesse: 'S',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '99',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 8,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-11',
            inventarArtikel_Farbe: 'blau',
            inventarArtikel_Konfektionsgroesse: 'M',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          }
        ],
      },
      {
        inventarBuchung_IDInventarBuchungen: 153,
        inventarBuchung_DatumBuchung: '01.08.2024',
        inventarBuchung_IDBenutzer: '6',
        benutzer_Vorname: 'Isabella',
        benutzer_Nachname: 'Mülle',
        inventarBuchung_AusgeliehenBis: '',
        inventarBuchung_abgeschlossen: 'false',
        artikel: [
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '99',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 8,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-11',
            inventarArtikel_Farbe: 'blau',
            inventarArtikel_Konfektionsgroesse: 'M',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '137',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 2,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-8',
            inventarArtikel_Farbe: 'schwarz',
            inventarArtikel_Konfektionsgroesse: 'L',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
        ],
      }
    ],
  },
  {
    easyVereinMitglied_firstName: 'Daniela',
    easyVereinMitglied_lastName: 'Teufel',
    easyVereinMitglied_id: 98765,
    inventarBuchung:[
      {
        inventarBuchung_IDInventarBuchungen: 166,
        inventarBuchung_DatumBuchung: '17.07.2024',
        inventarBuchung_IDBenutzer: '8',
        benutzer_Vorname: 'Philipp',
        benutzer_Nachname: 'Lacker',
        inventarBuchung_AusgeliehenBis: '',
        inventarBuchung_abgeschlossen: 'false',
        artikel: [
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '154',
            inventarArtikel_IDInventarArtikel: 'Rock',
            inventarBuchungenPositionen_Preis: 7,
            lager_Bestand: 5,
            inventarBuchungenPositionen_externeInventarNummer: 'Rock-11',
            inventarArtikel_Farbe: 'rot',
            inventarArtikel_Konfektionsgroesse: 'XL',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '137',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 2,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-8',
            inventarArtikel_Farbe: 'schwarz',
            inventarArtikel_Konfektionsgroesse: 'L',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '111',
            inventarArtikel_IDInventarArtikel: 'Hexen-Peter',
            inventarArtikel_Preis: 10,
            lager_Bestand: 1,
            inventarBuchungenPositionen_externeInventarNummer: 'Hexen-Peter-01',
            inventarArtikel_Farbe: 'schwarz',
            inventarArtikel_Konfektionsgroesse: 'S',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '99',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 8,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-11',
            inventarArtikel_Farbe: 'blau',
            inventarArtikel_Konfektionsgroesse: 'M',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          }
        ],
      },
      {
        inventarBuchung_IDInventarBuchungen: 153,
        inventarBuchung_DatumBuchung: '01.08.2024',
        inventarBuchung_IDBenutzer: '6',
        benutzer_Vorname: 'Isabella',
        benutzer_Nachname: 'Mülle',
        inventarBuchung_AusgeliehenBis: '',
        inventarBuchung_abgeschlossen: 'false',
        artikel: [
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '99',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 8,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-11',
            inventarArtikel_Farbe: 'blau',
            inventarArtikel_Konfektionsgroesse: 'M',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
          {
            Menge: '1',
            inventarBuchungenPositionen_IDinventarBuchungenPositionen: '137',
            inventarArtikel_IDInventarArtikel: 'Bluse',
            inventarArtikel_Preis: 7,
            lager_Bestand: 2,
            inventarBuchungenPositionen_externeInventarNummer: 'Bluse-8',
            inventarArtikel_Farbe: 'schwarz',
            inventarArtikel_Konfektionsgroesse: 'L',
            inventarBuchungenPositionen_AusgeliehenBis: '31.12.2024',
          },
        ],
      }
    ],
  },
]


const testItemsMembers =[
  {
    firstName: 'Marc',
    lastName: 'Baumann',
  },
  {
    firstName: 'Heike',
    lastName: 'Baumann',
  },
  {
    firstName: 'Daniela',
    lastName: 'Teufel',
  }
]

const testItemsArtikel =[
  {
    Menge: '1',
    IDInventarArtikel: 'Rock',
    Preis: 7,
    Bestand: 5,
    externeID: 'Rock-11',
    Farbe: 'rot',
    Konfektionsgroesse: 'XL'
  },
  {
    Menge: '1',
    IDInventarArtikel: 'Bluse',
    Preis: 7,
    Bestand: 5,
    externeID: 'Bluse-5',
    Farbe: 'blau',
    Konfektionsgroesse: 'L'

  },
  {
    Menge: '1',
    IDInventarArtikel: 'Hexen-Peter',
    Preis: 10,
    Bestand: 5,
    externeID: 'HexenPeter-20-1234567890',
    Farbe: 'schwarz',
    Konfektionsgroesse: 'S'
  },
  {
    Menge: '1',
    IDInventarArtikel: 'Hexen-Peter',
    Preis: 10,
    Bestand: 5,
    externeID: 'HexenPeter-19',
    Farbe: 'schwarz',
    Konfektionsgroesse: 'M'

  }
]

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
            <!-- Zweite Ebene Leihvorgang -->
            <v-expansion-panels accordion>
              <v-expansion-panel v-for="(subItem) in item.leihvorgaengeBuchungen" :key="subItem.inventarBuchung_IDInventarBuchungen">
                <v-expansion-panel-title>
                  Leihvorgang: {{ subItem.inventarBuchung_IDInventarBuchungen }}
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
                            <v-list-item-title>Artikel</v-list-item-title>
                          </v-list-item-action>
                        </v-col>

                        <v-list-item-action class="mr-7">
                          <v-list-item-title>Preis</v-list-item-title>
                        </v-list-item-action>

                      </v-row>
                      <v-divider></v-divider>
                      <v-list-item v-for="(item, index) in testItemsArtikel" :key="index" class="mb-2 mt-2">
                        <v-row no-gutters align="start" class="w-100">
                          <v-col cols="1" class="d-flex align-center" > <!-- Flexibel halten und rechten Abstand hinzufügen -->
                            <v-img
                                :src="`${imageUrl}${item.Bildpfad}`"
                                alt="Artikelbild"
                                min-height="50"
                                min-width="50"
                                max-width="70"
                                max-height="70"
                                class="mt-2"
                            ></v-img>
                          </v-col>

                          <v-col cols="2" class="mb-2">
                            <v-list-item-title>Nummer: {{ item.externeID }}</v-list-item-title>
                            <v-list-item-title>{{ item.ArtikelBezeichnung }}</v-list-item-title>
                            <v-list-item-subtitle>Farbe: {{ item.Farbe }} </v-list-item-subtitle>
                            <v-list-item-subtitle>Größe: {{ item.Konfektionsgroesse }}</v-list-item-subtitle>
                            <v-list-item-subtitle>Menge: {{ item.Menge }} Stück</v-list-item-subtitle>
                          </v-col>

                          <v-col cols="4" class="d-flex flex-column justify-end align-center align-self-stretch mb-2">

                            <v-label @click="deleteItem(item.IDInventarArtikel)" class="hover text-subtitle-2"
                            >
                              <v-icon class="mr-1">mdi-arrow-down-thin-circle-outline</v-icon>
                              Rücknahme
                            </v-label>

                          </v-col>

                          <v-col cols="2" class="d-flex flex-column justify-end align-start align-self-stretch mb-2">
                            <v-label @click="deleteItem(item.IDInventarArtikel)" class="hover text-subtitle-2"
                            >
                              <v-icon class="mr-1">mdi-pencil-outline</v-icon>
                              Nummer ändern
                            </v-label>
                          </v-col>

                          <v-col cols="2" class="d-flex flex-column justify-end align-start align-self-stretch mb-2">
                            <v-label
                                @click="showDialogForExterneID(item.Menge, item.IDInventarArtikel)"
                                class="hover text-subtitle-2 text-blue-darken-4 mt-2"
                            >
                              <v-icon class="mr-1">mdi-sync</v-icon>
                              Artikel austauschen
                            </v-label>
                          </v-col>

                          <v-col cols="1" class="d-flex justify-end align-end">
                            <v-list-item-title>{{ Math.round(((item.Preis * item.Menge) *100) /100).toFixed(2) }} €</v-list-item-title>
                          </v-col>

                          <v-divider></v-divider>

                        </v-row>
                      </v-list-item>

                      <v-row>
                        <v-col class="d-flex justify-end mr-0">
                          <v-list-item-action class="mr-2">
                            <v-list-item-title><b>Gesamtpreis: {{ (Math.round(cartItemsAmount *100) /100).toFixed(2) }} €</b></v-list-item-title>
                          </v-list-item-action>
                        </v-col>

                      </v-row>
                    </v-list>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </v-container>
</template>

<style scoped>

</style>