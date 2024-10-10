<script setup>
import { ref } from 'vue'
import Mitglieder from "@/components/Mitglieder.vue";
import store from "@/store/store.js"
import Artikel from "../components/Artikel.vue";
const selectedMember = ref(null);
const isSelectedMember = ref(false);
const currentPage = ref(0);

const components = ['Mitglieder','Artikel']

function previousPage(){
  if(currentPage.value > 0){
    currentPage.value--;
  }
}

function nextPage(){
  if (currentPage.value < components.length - 1) {
    currentPage.value++;
  }
}

function handleMemberSelect(member) {
  selectedMember.value = member; // Speichert das ausgewählte Mitglied
  store.dispatch('setBorrowMember', selectedMember);
  isSelectedMember.value = !!store.getters.getBorrowMember.firstName
  console.log('selectedMember', selectedMember);
  console.log('selectedMember', selectedMember.value.firstName);
  console.log('store', store.getters.getBorrowMember.firstName);
}

function deleteSelectedMember(){
  selectedMember.value = null;
  store.dispatch('setBorrowMember', []);
  isSelectedMember.value = !!store.getters.getBorrowMember.firstName
  console.log('store', store.getters.getBorrowMember.firstName);
}

</script>

<template>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="8">
        <v-card class="d-flex align-center pe-2 mb-4">
          <v-icon>mdi-handshake</v-icon>
          <v-spacer></v-spacer>
          <v-card-title>Leihvorgang beginnen</v-card-title>
          <v-spacer></v-spacer>
         </v-card>

        <v-card class="vCardButtons d-flex mb-2">
          <v-btn color="grey" @click="previousPage" v-show="currentPage>0">zurück</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="nextPage" :disabled="!isSelectedMember">weiter</v-btn>
        </v-card>

        <v-card class="vCardMitgliedSuchen">
          <!-- Anzeige ausgewähltes Mitglied auf Desktops -->
          <v-card
              v-if="selectedMember && selectedMember.firstName && $vuetify.display.mdAndUp"
              class="d-flex align-center"
              flat
              height="75px"
              color="success"
          >
            <!-- Icon links (Start) -->
            <v-icon class="ml-2" @click="deleteSelectedMember()">mdi-close-circle</v-icon>

            <!-- Spacer zwischen Icon und Titel -->
            <v-spacer></v-spacer>

            <!-- Titel und Untertitel zentral -->
            <div class="text-center">
              <v-card-subtitle>ausgewählt:</v-card-subtitle>
              {{ selectedMember.firstName }} {{ selectedMember.familyName }}
            </div>

            <!-- Spacer rechts vom Titel -->
            <v-spacer></v-spacer>
          </v-card>
          <!-- Anzeige ausgewähltes Mitglied auf mobilen Geräte -->
          <v-chip
              v-if="selectedMember && selectedMember.firstName && $vuetify.display.mobile"
              class="mt-2 ml-2 mb-2"
              variant="flat"
              color="green"
              prepend-icon="mdi-close-circle-outline v-chip--active"
              @click="deleteSelectedMember"
          >
            {{selectedMember.firstName}} {{selectedMember.familyName}}
          </v-chip>
          <!--hier wird die Auswahl aus Mitglieder empfangen und an handleMemberSelect übergeben -->
          <!-- in v-if funktioniert isSelectedMember.value nicht  -->
          <Mitglieder v-if="currentPage===0"  @memberSelected="handleMemberSelect"/>
          <Artikel v-if="currentPage===1"/>
        </v-card>
      </v-col>
    </v-row>
</template>

<style scoped>

.vCardMitgliedSuchen{
  min-height: 80vh;
  background-color: #BDBDBD;
}
.vCardTitle{
  min-height: 8vh;
}

.vCardButtons{
  background-color: transparent;
  border: none;
  box-shadow: none
}

</style>