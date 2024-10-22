<script setup>
import {computed, ref, watch, onMounted} from 'vue'
import Mitglieder from "@/components/Mitglieder.vue";
import WarenkorbDesktop from "@/components/WarenkorbDesktop.vue";
import Artikel from "../components/Artikel.vue";
import Checkout from "@/components/Checkout.vue";
import DialogExterneNummer from "@/components/DialogExterneNummer.vue";
import OverlayWaiting from "@/components/OverlayWaiting.vue";
import store from "@/store/store.js"
import AuthenticationService from "@/services/AuthenticationService.js";

const isLoading = ref(false);
const selectedMember = ref(null);
const isSelectedMember = ref(false);
const currentPage = ref(0);
const showCart = computed(()=> store.getters.getShowWarenkorbDesktop);
const cartItems = computed(()=> store.getters.getCartItems)
const borrowMember = computed(()=> store.getters.getBorrowMember)
const user = computed(()=> store.getters.getUserData)
const snackbar = ref(false);
const snackbarText = ref('')
const snackbarColor = ref('error')
const vChipColors = ref(['success', 'primary', 'primary']) //Steuerung der vChip Farben Anzeigenschritte

onMounted(()=> {
  updateChipColors() //Steuerung der vChip Farben Anzeigenschritte
})

// watch(currentPage, (newVal) => {
//   if(newVal === 0 && !store.getters.getBorrowMember || store.getters.getBorrowMember.length === 0){
//     btnNextPageDisable.value = true;
//     console.log('watch currentPager:', newVal)
//     console.log('watch borrowMember:', store.getters.getBorrowMember)
//   }
// })


//WarenkorbDesktop btn "zur Kasse" liefert true, wenn dieser geklickt wird
defineProps({
  goToCheckout: Boolean,
})

//Button aktivieren und deaktivieren
const btnNextPageDisable = computed(()=>{
    if(currentPage.value === 0 && isSelectedMember.value)
    {
      return true;
    }
    if(currentPage.value === 1 && store.getters.getCartItemCount > 0 && isSelectedMember.value){
      return true;
    }
    if(currentPage.value === 2 && store.getters.getCartItemCount > 0 && isSelectedMember.value){
      return true;
    }
});

//Eine Seite zurück innerhalb der v-card
function previousPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    updateChipColors(); //Steuerung der vChip Farben Anzeigenschritte
  }
}

//Gibt für die jeweilige Unterseite die Beschriftung für den Button zurück
const btnText = computed(()=>{
  //Mitglieder
  if(currentPage.value === 0){
    return 'Artikel wählen';
  }
  //Artikel
  if(currentPage.value === 1){
    return 'zur Übersicht';
  }
  //Checkout
  if(currentPage.value === 2) {
    return  'Vorgang buchen';
  }
});

//Eine Seite vor innerhalb der v-card und die Buttonbeschriftung anpassen
//Nur wenn Unterseite = 2 ist, dann wir der leihvorgangBuchen() ausgeführt, sonst eine Seite nach vorne navigiert
async function nextPage() {
  if (currentPage.value === 2) {
    await leihvorgangBuchen();
  } else {
    currentPage.value += 1;
    updateChipColors(); //Steuerung der vChip Farben Anzeigenschritte
  }
}

async function leihvorgangBuchen(){
  let response = '';
  try{
    isLoading.value = true;
    console.log('currentPage vuex getCartItems', cartItems.value);
    console.log('user:', user)

    response = await AuthenticationService.leihvorgangBuchen({
      cartItems: cartItems.value,
      IDMitglied: borrowMember.value.id,
      IDBenutzer: localStorage.idBenutzer,
    });
    console.log('Erfolg leihvorgangBuchen', response.data);
    store.dispatch('clearCartItems') //Setzt den vuex-Store für den Leihvorgang auf Anfang (null)
    snackbarText.value = 'Leihvorgang wurde erfolgreich gebucht';
    snackbarColor.value = "success"
    snackbar.value = true;
    isSelectedMember.value = false;
    currentPage.value = 0; //Navigiert zur MitgliederSeite und die Auswahl kann von vorne beginnen!
  }catch(err){
    isLoading.value = false;
    console.log('Fehler leihvorgangBuchen', response.data, err)
    snackbarText.value = 'Leihvorgang konnte nicht gebucht werden!';
    snackbarColor.value = "error"
    snackbar.value = true;
  }
  isLoading.value = false;
}

//Speichert das ausgewählte Mitglied im vuex-Store
function handleMemberSelect(member) {
  selectedMember.value = member; // Speichert das ausgewählte Mitglied
  store.dispatch('setBorrowMember', selectedMember);
  isSelectedMember.value = !!store.getters.getBorrowMember.firstName
  console.log('selectedMember', selectedMember);
  console.log('selectedMember', selectedMember.value.firstName);
  console.log('store', store.getters.getBorrowMember.firstName);
}

//Löscht das aktuell ausgewählte Mitglied im vuex-Store
function deleteSelectedMember(){
  selectedMember.value = null;
  store.dispatch('setBorrowMember', []);
  isSelectedMember.value = !!store.getters.getBorrowMember.firstName
  console.log('store', store.getters.getBorrowMember.firstName);
}

//Steuerung der vChip Farben Anzeigenschritte
function updateChipColors() {
  vChipColors.value = ['primary', 'primary', 'primary'];
  vChipColors.value[currentPage.value] = 'success';
}

</script>

<template>

  <v-snackbar
      v-model="snackbar"
      multi-line
      location="top"
      timeout="5000"
      :color="snackbarColor"
  >
    {{ snackbarText }}

    <template v-slot:actions >
      <v-btn
          color="black"
          variant="text"
          @click="snackbar = false"
          style="background-color: white; text-transform: none;"
      >
        Schließen
      </v-btn>
    </template>

  </v-snackbar>

  <v-container
      fluid
      :class="{
      'pa-0 ma-0': $vuetify.display.mobile, // Klasse für mobile Geräte
      'ma-auto': !$vuetify.display.mobile // Klasse für größere Bildschirme
    }"
  >


    <OverlayWaiting v-if="isLoading"></OverlayWaiting>
    <DialogExterneNummer></DialogExterneNummer>
    <!-- @goToCheckout="nextPage" rufe die Funktion nextPage auf  -->
    <WarenkorbDesktop v-if="showCart && $vuetify.display.mdAndUp" @goToCheckout="nextPage"/>

  <!-- Da v-show nicht funktioniert und die v-card mit dem Hauptinhalt nach rechts rückt sobald WarenkorbDesktop mit v-if aus dem DOM
   verschwindet, verwende ich in Abhängigkeit von showCart end oder center bei v-row justify-->
  <v-row :justify="showCart ? 'end' : 'center'">
    <v-col cols="12" md="8" lg="8">
  <!--Anzeige der Schritte (Stepper)      -->
      <v-card class="d-flex mb-4 bg-transparent rounded-0">
        <v-chip
            class="flex-grow-1 vChipStep rounded-0 mr-1 justify-center text-h6"
            :color="vChipColors[0]"
        >
          <v-icon icon="mdi-numeric-1-circle" start></v-icon>
          Mitglied auswählen
        </v-chip>
        <v-chip
            class="flex-grow-1 vChipStep rounded-0 mr-1 justify-center text-h6"
            :color="vChipColors[1]"
        >
          <v-icon icon="mdi-numeric-2-circle" start></v-icon>
          Artikel auswählen
        </v-chip>
        <v-chip
            class="flex-grow-1 vChipStep rounded-0 justify-center text-h6"
            :color="vChipColors[2]"
        >
          <v-icon icon="mdi-numeric-3-circle" start></v-icon>
          Vorgang buchen
        </v-chip>
      </v-card>

      <!--Buttons zurück und Navigation vorwärts-->
      <v-card class="vCardButtons d-flex mb-2">
        <v-btn color="grey" @click="previousPage" v-show="currentPage>0" > <v-icon class="mr-2">mdi-arrow-left-circle</v-icon>zurück</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="red darken-2" @click="nextPage" :disabled="!btnNextPageDisable">{{ btnText }}<v-icon class="ml-2">mdi-arrow-right-circle</v-icon></v-btn>
      </v-card>



      <v-card class="vCardMitgliedSuchen w-100">
        <!-- Anzeige ausgewähltes Mitglied auf Desktops -->
        <v-card
            v-if="selectedMember && selectedMember.firstName && $vuetify.display.mdAndUp"
            class="d-flex align-center"
            flat
            height="75px"
            color="teal darken-4"
        >
          <!-- Icon links (Start) -->
          <v-icon class="ml-2" @click="deleteSelectedMember()">mdi-close-circle</v-icon>

          <!-- Spacer zwischen Icon und Titel -->
          <v-spacer></v-spacer>

          <!-- Titel und Untertitel zentral -->
          <div class="text-center text-h5">
            <v-card-subtitle class="text-h6">ausgewählt:</v-card-subtitle>
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
        <v-row>
          <v-col cols="12">
            <Mitglieder v-if="currentPage === 0" @memberSelected="handleMemberSelect" />
            <Artikel v-if="currentPage === 1" />
            <Checkout v-if="currentPage === 2" />
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
  </v-container>

</template>

<style scoped>

.vCardMitgliedSuchen{
  min-height: 80vh;
  background-color: #FAFAFA;
  width: 100%;
}
.vCardTitle{
  min-height: 8vh;
}

.vCardButtons{
  background-color: transparent;
  border: none;
  box-shadow: none
}

.vChipStep{
  min-height: 40px;
}



</style>