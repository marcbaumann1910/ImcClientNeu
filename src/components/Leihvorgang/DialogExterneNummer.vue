<script setup>
import {ref, computed, watch} from "vue";
import store from "@/store/store.js";
import AuthenticationService from "@/services/AuthenticationService.js";

//Zeigt den Dialog abhängig vom Wert im vuex-Store an. Ist ein Object!!!
const showDialog = computed(()=> store.getters.getShowDialogExterneInventarNummer.showDialog)
const dialogFormFields = computed(()=> store.getters.getShowDialogExterneInventarNummer.Menge)
//Holt die IDInventarArtikel aus dem Dialog zur Erfassung der ExtenenInventarNummern
const idArtikel = computed(()=> store.getters.getShowDialogExterneInventarNummer.idArtikel)
const externeInventarNummerPflicht = computed(()=> store.getters.getShowDialogExterneInventarNummer.externeInventarNummerPflicht)
const idInventarKategorie = computed(()=> store.getters.getShowDialogExterneInventarNummer.idInventarKategorie)

const textInventarNummern = ref([]);
const inventarExterneNummern = ref([]);

//Sorgt dafür, dass die ExternenInventarNummern (externeID), die in cartItems als Array gespeichert sind
//dem jeweiligen Textfeld - passend zur idArtikel - im vuex-Store gespeichert werden und beim Öffnen
//des Dialogs wieder geladen werden.
//Warum das Ganze ? Da sonst bei Eingabe einer externenID diese in allen Textfeldern der gleiche Inhalt
//gespeichert wird und nicht je idArtikel die Eingabe der externenID zugeordnet ist.
watch(
    () => showDialog.value,
    async (newVal) => {
      if (newVal) {
        // Dialog wird geöffnet
        textInventarNummern.value = [...store.getters.getExterneNummernForArtikel(idArtikel.value)];

        await fetchInventarExterneNummer();

        // Anpassung der Länge von textInventarNummern
        if (textInventarNummern.value.length < dialogFormFields.value) {
          const differenz = dialogFormFields.value - textInventarNummern.value.length;
          textInventarNummern.value.push(...Array(differenz).fill(''));
        } else if (textInventarNummern.value.length > dialogFormFields.value) {
          textInventarNummern.value = textInventarNummern.value.slice(0, dialogFormFields.value);
        }
      }
    },
    { immediate: true }
);

function dialogClose(){
  store.dispatch("setShowDialogExterneInventarNummer", {showDialog: false, Menge: 0})
}

function dialogSave(){
  store.dispatch("setShowDialogExterneInventarNummer", {showDialog: false, Menge: 0})
  const idArtikel = store.getters.getShowDialogExterneInventarNummer.idArtikel
  //Speichern der erfassten Externen Inventar Nummern im vuex-Store
  store.dispatch('setExterneInventarNummerToCartItem', {idArtikel: idArtikel, externeID: textInventarNummern});
  console.log('getCartItems from vuex:', store.getters.getCartItems)
  console.log('2 DialogExterneNummer from vuxe', store.getters.getShowDialogExterneInventarNummer.idArtikel);
}

//Auführliche siehe Doku
// --> Besonderheit, wenn ein Element im v-select ausgewählt wurde, ist es in den anderen v-select nicht mehr auswählbar:
function filteredInventarExterneNummern(index) {
  const selectedIDs = textInventarNummern.value
      .map((item, idx) => idx !== index ? item : null)
      .filter(item => item !== null);
  //Ich gleiche hier nicht die ID der externenNummer ab, sondern die Bezeichnung (eigentliche Nummer) ab
  return inventarExterneNummern.value.filter(option => !selectedIDs.includes(option.ExterneNummer));
}

async function fetchInventarExterneNummer(){
  //Abruf der Daten inventarExterneNummern, um diese in der Select-Auswahl anzuzeigen!
  try{
    const response = await AuthenticationService.leihvorgangInventarExterneNummern(idInventarKategorie.value)
    inventarExterneNummern.value = response.data;
    console.log('inventarExterneNummern:', response.data)
  }catch(err)
  {
    console.log('Fehler beim Versuch des Datenabrufes!')
  }
}

</script>

<template>
  <!-- Dialog -->
  <v-dialog v-model="showDialog" max-width="500px">
    <v-card
        prepend-icon="mdi-application-edit"
        title="Externe Inventar-Nummer"
    >
      <v-card-text>
        <v-row dense>
          <v-col
          >
          <template v-if="!externeInventarNummerPflicht">
          <!--generiert die Textfelder abhängig von der gewählten Menge des jeweiligen Artikels. Menge wird auch über den vuex-Store übergeben-->
            <v-text-field
                :label="'Inventar-Nummer ' + i"
                v-for="i in dialogFormFields" :key="i"
                v-model="textInventarNummern[i - 1]"
            >
            </v-text-field>
            </template>
            <template v-else>
              <!--Ist die InventarNummer Pflicht, werden die verfügbaren Nummern in den Selects aufgelistet-->
              <!--generiert die Selects abhängig von der gewählten Menge des jeweiligen Artikels. Menge wird auch über den vuex-Store übergeben-->
              <!--item-value="ExterneNummer" Muss auch die ExterneNummer sein, da diese im vuexStore gespeichert und später für das InsertUpdate benötigt wird!!!-->
              <!--Siehe Doku DialogExterneNummer.vue Besonderheit v-select  -->
              <v-select
                  v-for="(value, index) in textInventarNummern"
                  :key="'select-' + index"
                  v-model="textInventarNummern[index]"
                  :items="filteredInventarExterneNummern(index)"
                  item-title="ExterneNummer"
                  item-value="ExterneNummer"
                  label="'Bitte die Inventar Nummer wählen'"
                  persistent-hint
                  single-line
            ></v-select>
            </template>
          </v-col>
        </v-row>

      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
            text="Schließen"
            variant="plain"
            @click="dialogClose"
        ></v-btn>

        <v-btn
            color="primary"
            text="Speichern"
            variant="tonal"
            @click="dialogSave"
        ></v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>