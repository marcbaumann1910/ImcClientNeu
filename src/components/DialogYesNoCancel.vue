<script setup>
import {computed, ref} from 'vue';
import store from "@/store/store.js";

const show = computed(()=> store.getters.getShowDialogYesNoCancel.showDialog);
const dialogTitle = computed(()=> store.getters.getShowDialogYesNoCancel.title)
const dialogText = computed(()=> store.getters.getShowDialogYesNoCancel.text)
const dialogYesVisible = computed(()=> store.getters.getShowDialogYesNoCancel.showButtonYes)
const dialogNoVisible = computed(()=> store.getters.getShowDialogYesNoCancel.showButtonNo)
const dialogCancelVisible = computed(()=> store.getters.getShowDialogYesNoCancel.showButtonCancel)
const dialogOKVisible = computed(()=> store.getters.getShowDialogYesNoCancel.showButtonOK)

//Wenn nur die Anzeige des OK Button gewünscht ist, reich die Übergabe showButtonOK: true.
//Der Rest erledigt diese Funktion
if(dialogOKVisible.value){
  store.dispatch('setShowDialogYesNoCancel',{
    showDialog: true,
    title: store.getters.getShowDialogYesNoCancel.title,
    text: store.getters.getShowDialogYesNoCancel.text,
    showButtonYes: false,
    showButtonNo: false,
    showButtonCancel: false,
    showButtonOK: true
  })
}

function onOKClick(){
  closeDialog();
  const resolver = store.state.dialogResolver;
  // if (resolver) {
  //   resolver('ok');
  //   store.commit('setDialogResolver', null);
  // }
}

function onYesClick() {
  closeDialog();
  const resolver = store.state.dialogResolver;
  if (resolver) {
    resolver('yes');
    store.commit('setDialogResolver', null);
  }
}

function onNoClick() {
  closeDialog();
  const resolver = store.state.dialogResolver;
  if (resolver) {
    resolver('no');
    store.commit('setDialogResolver', null);
  }
}

function onCancelClick() {
  closeDialog();
  const resolver = store.state.dialogResolver;
  if (resolver) {
    resolver('cancel');
    store.commit('setDialogResolver', null);
  }
}

function closeDialog() {
  // Mutation aufrufen, um showDialog = false zu setzen
  store.commit('setShowDialogYesNoCancel', { showDialog: false });
}

// Mache openDialog von außen aufrufbar
</script>

<template>
  <v-dialog v-model="show" max-width="400px">
    <v-card>
      <v-card-subtitle class="mt-2">{{dialogTitle}}</v-card-subtitle>
      <v-card-title class="mobile-text-small">{{ dialogText }}</v-card-title>
      <v-card-actions>
        <v-btn v-if="dialogOKVisible" color="success" variant="flat" @click="onOKClick">OK</v-btn>
        <v-btn v-if="dialogYesVisible" color="success" variant="flat" @click="onYesClick">Ja</v-btn>
        <v-btn v-if="dialogNoVisible" color="error" variant="flat" @click="onNoClick">Nein</v-btn>
        <v-btn v-if="dialogCancelVisible" @click="onCancelClick" variant="flat">Abbrechen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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