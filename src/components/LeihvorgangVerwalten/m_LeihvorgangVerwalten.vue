<script setup>
import {ref, computed, onMounted, watch} from 'vue'
const imageUrl = process.env.VITE_API_URL
import { useLeihvorgangVerwalten } from '@/composables/useLeihvorgangVerwalten.js';
import DialogRuecknahme from "@/components/LeihvorgangVerwalten/DialogRuecknahme.vue";
import DialogNummerAendern from "@/components/LeihvorgangVerwalten/DialogNummerAendern.vue";
import DialogArtikelTausch from "@/components/LeihvorgangVerwalten/DialogArtikelTausch.vue";
import DialogToolTip from "@/components/DialogToolTip.vue";
import { checkStatusZustandArtikel,expansionForLeihvorgang,formatDate,isVisibleIventarStatus} from "@/scripte/globalFunctions.js";
import store from "@/store/store.js";
import cloneDeep from 'lodash/cloneDeep'; // Importiere cloneDeep für tiefe Kopien

const artikelDetails = ref(null);
const checkedAusgeliehen = ref(true);
const checkedAbgeschlossen = ref(false);
const searchArtikel = ref('');
// Reaktiver Zustand für den Dialog
const showDialogTooltip = ref(false);

//Holt das member Object aus dem vuex-Store
const member = computed(() => store.getters.getMember);
// Lokale Kopie des Mitglieds (initialisiert mit einer tiefen Kopie aus dem Store)
// Da mit einem computed erstellten Object (read-only) in der Funktion
// expansionForLeihvorgang nicht gearbeitet werden kann, da das Object verändert wird!
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
  // Hier wird das updateMember aus expansionForLeihvorgang (wenn sich die Daten durch das Backend ändern)
  // verarbeitet und im Store gespeichert und an die lokale Kopie (localMember) übergeben!
  const updatedMember = await expansionForLeihvorgang(localMember.value, true);
  if (updatedMember) {
    await store.dispatch('setMember', updatedMember);
    localMember.value = cloneDeep(updatedMember);
    artikelDetails.value = updatedMember.leihvorgaengeArtikelDetails;
  }

  console.log('member nach expansionForLeihvorgang:', localMember.value);
});

const kebabs = [
  { title: 'Rücknahme', action: showDialogRuecknahme, icon: 'mdi-arrow-down-thin-circle-outline' },
  { title: 'Nummer ändern', action: showDialogNummerAendern, icon: 'mdi-pencil' },
  { title: 'Tausch', action: showDialogArtikelTausch, icon: 'mdi-swap-horizontal' },
];

async function showDialogArtikelTausch(artikelDetails) {
  store.dispatch('setShowDialogArtikelTausch', {
    showDialog: true,
    artikelDetails: artikelDetails,
  })
}

function showDialogNummerAendern(artikelDetails ){
  store.dispatch('setShowDialogNummerAendern', {
    showDialog: true,
    idInventarArtikel: artikelDetails.ia_IDInventarArtikel,
    artikelDetails: artikelDetails,
  })
}

function showDialogRuecknahme(artikelDetails) {
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

//Da ich in der Desktop-Ansicht mit checkboxen arbeite, übernehme ich die Logik über den vuex-Store auch in
//mobilen Ansicht. Allerdings sind es hier keine Checkboxen, sondern Chips, weshalb ich den Zustand geklickt oder nicht
//zwischenspeichere
//!!!Die Funktion expansionForLeihvorgang() in globalFunction greift auf den vuex-Store zu und holt sich dort die Informationen
//zum 'checked' Status
async function handleCheckboxAusgeliehen(){
  checkedAusgeliehen.value = !checkedAusgeliehen.value;
  await store.dispatch('setShowAusgeliehenAbgeschlossen', {idMitglied: localMember.value.easyVereinMitglied_id, checkedStateAusgeliehen: checkedAusgeliehen.value})
  console.log('checkedAusgeliehen',checkedAusgeliehen.value)
  // Hier wird das updateMember aus expansionForLeihvorgang (wenn sich die Daten durch das Backend ändern)
  // verarbeitet und im Store gespeichert und an die lokale Kopie (localMember) übergeben!
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
  // Hier wird das updateMember aus expansionForLeihvorgang (wenn sich die Daten durch das Backend ändern)
  // verarbeitet und im Store gespeichert und an die lokale Kopie (localMember) übergeben!
  const updatedMember = await expansionForLeihvorgang(localMember.value, true);
  if (updatedMember) {
    await store.dispatch('setMember', updatedMember);
    localMember.value = cloneDeep(updatedMember);
    artikelDetails.value = updatedMember.leihvorgaengeArtikelDetails;
  }
}

const filteredArtikelDetails = computed(() => {
  if (!searchArtikel.value) {
    // Wenn kein Suchbegriff eingegeben wurde, gib alle Artikel zurück
    return artikelDetails.value;
  }
  // Ansonsten filtere die Artikel basierend auf dem Suchbegriff
  return artikelDetails.value.filter((item) => {
    const fullName = `${item.ia_ArtikelBezeichnung} ${item.ibp_externeInventarNummer} ${item.farbe}`.toLowerCase();
    return fullName.includes(searchArtikel.value.toLowerCase());
  });
});


const dialogTitle = ref('');
const dialogText = ref('');
// Methode zum Öffnen des Dialogs
function openDialogToolTip(dialogTitleOpen, dialogTextOpen) {
  showDialogTooltip.value = true;
  dialogTitle.value = dialogTitleOpen;
  dialogText.value = dialogTextOpen;
}

//globalFunctions
isVisibleIventarStatus;
checkStatusZustandArtikel;

</script>


<template>
  <!-- Suchfeld -->
  <v-row>
    <v-col class="d-flex justify-end">
      <router-link
          class="text-blue text-decoration-none"
          :to="{ name: 'leihvorgangverwalten' }"
      >
        <v-btn icon="mdi-arrow-left" size="24px" color="primary" class="mb-3 ml-2"></v-btn>
      </router-link>
      <v-spacer></v-spacer>
      <span class="mr-3"><b>{{localMember.easyVereinMitglied_firstName}} {{localMember.easyVereinMitglied_familyName}}</b></span>
<!--    <v-btn class="mb-3 mr-4" icon="mdi-close" max-height="10" max-width="10" color="transparent"></v-btn>-->
    </v-col>
  </v-row>


  <v-text-field
      v-model="searchArtikel"
      prepend-inner-icon="mdi-magnify"
      density="compact"
      label="Artikel suchen"
      variant="solo"
      clearable
      hide-details
      single-line
      max-width="400"
      class="ma-2"
  ></v-text-field>

    <v-row></v-row>

  <div class="d-flex justify-center mr-3">
  <v-chip class="ml-2 mt-6" color="orange"  @click="handleCheckboxAusgeliehen()">
    <v-icon v-if="checkedAusgeliehen">mdi-check</v-icon>
    <b> ausgeliehen </b>
  </v-chip>
  <v-spacer></v-spacer>
  <v-chip class="ml-2 mt-6" color="green" @click="handleCheckboxAbgeschlossen()">
    <v-icon v-if="checkedAbgeschlossen">mdi-check</v-icon>
    <b> abgeschlossen </b>
  </v-chip>
  </div>

  <div class="d-flex justify-center ml-2 mr-4 mt-2 mb-2">
      <v-icon size="small">mdi-cart</v-icon> {{localMember.anzahlArtikel}}
      <v-spacer></v-spacer>
      <v-icon size="small">mdi-currency-eur</v-icon> {{localMember.gesamtPreis}}
  </div>
  <v-divider class="ml-2 mr-4"></v-divider>
  <!-- Artikelkarte -->
  <v-card
      v-for="itemArtikelDetails in filteredArtikelDetails"
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
        <v-list-item
            v-for="kebab in kebabs"
            :key="kebab.title"
            @click="() => kebab.action(itemArtikelDetails, member)"
        >
          <v-list-item-title>
            <v-icon left class="mr-2" >{{ kebab.icon }}</v-icon>
            {{ kebab.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
      </v-menu>
    </v-toolbar>

    <!-- Restlicher Inhalt -->
    <v-row>
      <v-col cols="2">
        <v-avatar size="36px" class="ml-2 mt-2">
          <v-img
              alt="Avatar"
              :src="`${imageUrl}${itemArtikelDetails.ia_Bildpfad}`"
          ></v-img>
        </v-avatar>
      </v-col>

      <v-col cols="10">
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
          <v-icon :color="isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus) ? 'orange' : 'green'"
          >
            {{
              isVisibleIventarStatus(itemArtikelDetails.ibp_IDinventarBuchungenPositionenStatus) ? 'mdi-share' : 'mdi-lock'
            }}
          </v-icon>
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

        <v-card-subtitle
            class="py-1 my-0 text-caption"
        >
          <v-icon
              :color="checkStatusZustandArtikel(itemArtikelDetails.iz_IDInventarZustand).color"
              v-if="itemArtikelDetails.iz_Bezeichnung"
          >
            {{checkStatusZustandArtikel(itemArtikelDetails.iz_IDInventarZustand).icon}}
          </v-icon>
          {{itemArtikelDetails.iz_Bezeichnung}}
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
        <v-card-subtitle
            class="py-1 my-0 text-caption"
        >
          <v-icon
              color="black"
              class="ml-2"
              v-if="itemArtikelDetails.ibp_Bemerkung"
              @click="openDialogToolTip('Bemerkung', itemArtikelDetails.ibp_Bemerkung)"
          >
            mdi-comment
          </v-icon>
          {{itemArtikelDetails.ibp_Bemerkung}}
        </v-card-subtitle>
      </v-col>
    </v-row>
  </v-card>

  <DialogArtikelTausch :member="localMember"/>
  <DialogRuecknahme :member="localMember"/>
  <DialogNummerAendern :member="localMember"/>
  <!-- Dialog für den vollständigen Text -->
  <DialogToolTip
      v-model="showDialogTooltip"
      :dialogTitle="`${dialogTitle}`"
      :dialogText="`${dialogText}`"
  />

  <!-- Aktionsbuttons -->
<!--  <v-btn class="ml-4" min-width="335">Rücknahme</v-btn>-->
<!--  <v-btn class="mx-4 my-2" min-width="335">Nummer ändern</v-btn>-->
<!--  <v-btn class="mx-4" min-width="335">Artikeltausch</v-btn>-->
</template>



<style scoped>

.v-overlay__scrim {
  background-color: rgba(255, 255, 255, 0.01) ; /* Passe die Transparenz an */
}
</style>
