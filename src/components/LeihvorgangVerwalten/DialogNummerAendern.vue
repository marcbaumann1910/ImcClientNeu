<script setup>
import { ref, computed } from 'vue';
import store from "@/store/store.js";
import { expansionForLeihvorgang } from "@/scripte/globalFunctions.js";
import AuthenticationService from "@/services/AuthenticationService.js";
const newNumber = ref('');
const idInventarArtikel = computed(() => store.getters.getShowDialogNummerAendern.idInventarArtikel);

const props = defineProps({
  member: Object,
})

//Ausführlich siehe Doku
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

function dialogClose(){
  showDialog.value = false;
  newNumber.value = '';
}

async function dialogSave(){
    if(newNumber.value === '' && newNumber.value === undefined){
      alert('Bitte eine Nummer eingeben!')
      return;
    }

  try{
    const response = await AuthenticationService.leihvorgangNummerAendern({
      IDinventarBuchungenPositionen: idInventarArtikel.value,
      neueExterneInventarNummer: newNumber.value,
    })

  }catch(err){
    alert('Vorgang fehlgeschlagen. Nummer konnte nicht geändert werden')
    console.log(err)
    return;
  }

  await expansionForLeihvorgang(props.member, true)
  showDialog.value = false;
  alert('Die Nummer wurde erfolgreich geändert!')
  newNumber.value = '';
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

          <v-text-field
              label="Neue Nummer"
              v-model="newNumber"
          >

          </v-text-field>

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