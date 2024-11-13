<script setup>
import { ref, computed, watch } from 'vue';
import store from "@/store/store.js";
import { expansionForLeihvorgang } from "@/scripte/globalFunctions.js";
import AuthenticationService from "@/services/AuthenticationService.js";
const textExterneInventarNummer = ref('');
const inventarExterneNummern = ref([]);
const selectExterneInventarNummern = ref('');
const idInventarArtikel = computed(() => store.getters.getShowDialogNummerAendern.idInventarArtikel);
const artikelDetails = computed(() => store.getters.getShowDialogNummerAendern.artikelDetails);


const props = defineProps({
  member: Object,
})

//Ausführlich siehe Doku
//DialogNummerAendern.vue öffnen einer Dialog Komponente mit vuex-Store:
const showDialog = computed({
  get() {
    return store.getters.getShowDialogNummerAendern.showDialog;
  },
  set(value) {
    store.dispatch('setShowDialogNummerAendern', {
      ...store.getters.getShowDialogNummerAendern,
      showDialog: value,
    });
  }
});

// Watcher zum Abrufen der State Items beim Öffnen des Dialogs
watch(showDialog, (newVal) => {
  if(newVal){
    fetchInventarExterneNummer();
  }
});

function dialogClose(){
  showDialog.value = false;
  textExterneInventarNummer.value = '';
  selectExterneInventarNummern.value = '';
}

async function dialogSave(){
  //Wenn v-select sichtbar ist, dann wird gebprüft ob eine Auswahl stattgefunden hat!
  if (artikelDetails.value.ia_externeInventarNummerPflicht === 1) {
    if (!selectExterneInventarNummern.value || selectExterneInventarNummern.value === '') {
      alert('Bitte die Nummer auswählen!');
      return;
    }
  }else{
    if (!textExterneInventarNummer.value || textExterneInventarNummer.value === '') {
      alert('Bitte die Nummer auswählen!');
      return;
    }
  }

  try{
    const response = await AuthenticationService.leihvorgangNummerAendern({
      IDinventarBuchungenPositionen: idInventarArtikel.value,
      neueExterneInventarNummer: textExterneInventarNummer.value || selectExterneInventarNummern.value,

    })

    const responseExterneNummerVergeben = await AuthenticationService.leihvorgangInventarExterneNummernVergeben([selectExterneInventarNummern.value])
    console.log('responseExterneNummerVergeben', responseExterneNummerVergeben)
    const responseExterneNummerFreigeben = await AuthenticationService.leihvorgangInventarExterneNummernFreigeben([artikelDetails.value.ibp_externeInventarNummer])
    console.log('responseExterneNummerFreigeben', responseExterneNummerFreigeben)

  }catch(err){
    alert('Vorgang fehlgeschlagen. Nummer konnte nicht geändert werden')
    console.log(err)
    return;
  }

  await expansionForLeihvorgang(props.member, true)
  showDialog.value = false;
  alert('Die Nummer wurde erfolgreich geändert!')
  textExterneInventarNummer.value = '';
}

async function fetchInventarExterneNummer(){
  //Abruf der Daten inventarExterneNummern, um diese in der Select-Auswahl anzuzeigen!
  const response = await AuthenticationService.leihvorgangInventarExterneNummern(artikelDetails.value.ia_IDInventarKategorie)
  inventarExterneNummern.value = response.data;
  console.log('inventarExterneNummern:', response.data)
  console.log('artikelDetails.externeInventarNummerPflicht',artikelDetails.value.ia_externeInventarNummerPflicht)

}

</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
        v-model="showDialog"
        max-width="600"
    >

      <v-card
          prepend-icon="mdi-pencil-outline"
          title="Nummer ändern:"
          :subtitle="`${props.member.easyVereinMitglied_firstName} ${props.member.easyVereinMitglied_familyName}`"
      >
        <v-card-text>

          <template v-if="!artikelDetails.ia_externeInventarNummerPflicht">
            <v-text-field
                label="Neue Nummer eingeben"
                v-model="textExterneInventarNummer"
            >
            </v-text-field>
          </template>
          <template v-else>
            <!--Ist die InventarNummer Pflicht, werden die verfügbaren Nummern in den Selects aufgelistet-->
            <!--Siehe Doku DialogExterneNummer.vue Besonderheit v-select  -->
            <v-select
                v-model="selectExterneInventarNummern"
                :items="inventarExterneNummern"
                item-title="ExterneNummer"
                item-value="ExterneNummer"
                label="Bitte die Inventar Nummer wählen"
                persistent-hint
            ></v-select>
          </template>

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
              text="Nummer ändern"
              variant="tonal"
              @click="dialogSave()"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>

</style>