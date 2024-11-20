<script setup>
import { ref, computed, watch } from 'vue';
import store from "@/store/store.js";
import { expansionForLeihvorgang, fetchInventarExterneNummer } from "@/scripte/globalFunctions.js";
import AuthenticationService from "@/services/AuthenticationService.js";
const textExterneInventarNummer = ref('');
const inventarExterneNummern = ref([]);
const selectExterneInventarNummern = ref('');
const artikelDetails = computed(() => store.getters.getShowDialogNummerAendern.artikelDetails);
const IDinventarBuchungenPositionen = computed(() => store.getters.getShowDialogNummerAendern.artikelDetails.ibp_IDinventarBuchungenPositionen);


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
watch(showDialog, async (newVal) => {
  if (newVal) {
    inventarExterneNummern.value = await fetchInventarExterneNummer(artikelDetails.value.ia_IDInventarKategorie);
    if (inventarExterneNummern.value == null) {
      alert('Fehler beim Abruf der Inventar-Nummern!')
      return;
    }
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
      IDinventarBuchungenPositionen: IDinventarBuchungenPositionen.value,
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
  selectExterneInventarNummern.value = '';
  store.dispatch('setMember', props.member)//Wird für die m_LeihvorgangVerwalten benötigt, um Reaktivität zu gewährleisten
}

</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
        v-model="showDialog"
        max-width="600"
    >
      <v-container fluid>
        <v-row no-gutters>
          <v-col cols="12">
            <v-card
            >
              <v-card-title class="mobile-text-small">Nummer ändern:</v-card-title>
              <v-card-subtitle class="mobile-text-small">{{props.member.easyVereinMitglied_firstName}} {{props.member.easyVereinMitglied_familyName}}</v-card-subtitle>
              <v-card-subtitle class="mobile-text-small">{{artikelDetails.ia_ArtikelBezeichnung}} | {{artikelDetails.konfektionsGroesse_Konfektionsgroesse}} | {{artikelDetails.farbe}}</v-card-subtitle>
              <v-card-subtitle class="mobile-text-small">{{artikelDetails.ibp_externeInventarNummer}}</v-card-subtitle>
              <v-card-text>

                <template v-if="!artikelDetails.ia_externeInventarNummerPflicht">
                  <v-text-field
                      class="mobile-text-small"
                      label="Inventar Nummer wählen"
                      v-model="textExterneInventarNummer"
                      variant="solo-filled"
                  >
                  </v-text-field>
                </template>
                <template v-else>
                  <!--Ist die InventarNummer Pflicht, werden die verfügbaren Nummern in den Selects aufgelistet-->
                  <!--Siehe Doku DialogExterneNummer.vue Besonderheit v-select  -->
                  <v-select
                      class="mobile-text-small"
                      v-model="selectExterneInventarNummern"
                      :items="inventarExterneNummern"
                      item-title="ExterneNummer"
                      item-value="ExterneNummer"
                      label="Inventar Nummer wählen"
                      variant="solo-filled"
                      persistent-hint
                  ></v-select>
                </template>

              </v-card-text>

              <v-card-actions>
                <v-container fluid class="mb-0 mt-0">
                  <v-row no-gutters>
                    <v-col cols="12" sm="6" class="d-flex justify-end py-0 pr-1 mt-1">
                      <v-btn
                          block
                          color="primary"
                          text="Nummer ändern"
                          variant="flat"
                          @click="dialogSave()"
                      ></v-btn>
                    </v-col>
                      <v-col cols="12" sm="6" class="d-flex justify-end py-0 pr-1 mt-1">
                        <v-btn
                            block
                            color="grey"
                            text="Schließen"
                            variant="tonal"
                            @click="dialogClose"
                        ></v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-dialog>
  </div>
</template>

<style scoped>
/* Textgröße für mobile Geräte */
@media (max-width: 600px) {
  .mobile-text-small {
    font-size: 14px !important;
  }
}

/* Textgröße für größere Geräte */
@media (min-width: 601px) {
  .mobile-text-small {
    font-size: 16px !important;
  }
}

@media (max-width: 600px) {
  /* Textgröße für mobile Geräte in v-select */
  :deep(.mobile-text-small) .v-field-label,
  :deep(.mobile-text-small) .v-field__input {
    font-size: 14px !important;
  }
}

@media (min-width: 601px) {
  /* Textgröße für größere Geräte in v-select */
  :deep(.mobile-text-small) .v-field-label,
  :deep(.mobile-text-small) .v-field__input {
    font-size: 16px !important;
  }
}
</style>