<script setup>
import {computed, ref} from 'vue'
import Mitglieder from "@/components/Mitglieder.vue";
import WarenkorbDesktop from "@/components/WarenkorbDesktop.vue";
import store from "@/store/store.js"
import Artikel from "../components/Artikel.vue";
import Checkout from "@/components/Checkout.vue";
const selectedMember = ref(null);
const isSelectedMember = ref(false);
const currentPage = ref(0);
const btnText = ref('weiter');
const showCart = computed(()=> store.getters.getShowWarenkorbDesktop);

const btnNextPageDisable = computed(()=>{
    if(currentPage.value === 0 && isSelectedMember.value)
    {
      return true;
    }
    if(currentPage.value === 1 && store.getters.getCartItemCount > 0){
      return true;
    }
});



//Wird für das Navigieren innerhalb der v-card benötigt
const components = ['Mitglieder','Artikel', 'Checkout']

//Eine Seite zurück innerhalb der v-card
function previousPage(){
  if(currentPage.value > 0){
    currentPage.value--;
  }
  //Mitglieder
  if(currentPage.value === 0){
    btnText.value = 'weiter';
  }
  //Artikel
  if(currentPage.value === 1){
    btnText.value = 'zur Kasse';
  }
}

//Eine Seite vor innerhalb der v-card und die Buttonbeschriftung anpassen
function nextPage(){
  if (currentPage.value < components.length - 1) {
    currentPage.value++;
  }
  // <Mitglieder v-if="currentPage===0"
  // <Artikel v-if="currentPage===1"/>

  //Mitglieder
  if(currentPage.value === 0){
    btnText.value = 'weiter';
  }
  //Artikel
  if(currentPage.value === 1){
    btnText.value = 'zur Kasse';
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
  <v-container
      fluid
      :class="{
      'pa-0 ma-0': $vuetify.display.mobile, // Klasse für mobile Geräte
      'ma-auto': !$vuetify.display.mobile // Klasse für größere Bildschirme
    }"
  >
    <WarenkorbDesktop v-if="showCart && $vuetify.display.mdAndUp"/>
  <!-- Da v-show nicht funktioniert und die v-card mit dem Hauptinhalt nach rechts rückt sobald WarenkorbDesktop mit v-if aus dem DOM
   verschwindet, verwende ich in Abhängigkeit von showCart end oder center bei v-row justify-->
  <v-row :justify="showCart ? 'end' : 'center'">
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
        <v-btn color="primary" @click="nextPage" :disabled="!btnNextPageDisable">{{ btnText }}</v-btn>
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
        <Checkout v-if="currentPage===2"/>
      </v-card>
    </v-col>
  </v-row>
  </v-container>

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