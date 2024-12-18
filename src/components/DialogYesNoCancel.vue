<script setup>
import {computed, ref} from 'vue';
import store from "@/store/store.js";

const show = computed(()=> store.getters.getShowDialogYesNoCancel.showDialog);

function onYesClick() {
  store.dispatch("setShowDialogYesNoCancel", {
    response: "yes"
  });
}

function onNoClick() {
  store.dispatch("setShowDialogYesNoCancel", {
    response: "no"
  });
}

function onCancelClick() {
  store.dispatch("setShowDialogYesNoCancel", {
    response: "cancel"
  });
}

// Mache openDialog von außen aufrufbar
</script>

<template>
  <v-dialog v-model="show" max-width="400px">
    <v-card>
      <v-card-title class="text-h5">Aktion wirklich ausführen?</v-card-title>
      <v-card-actions>
        <v-btn color="primary" variant="flat" @click="onYesClick">Ja</v-btn>
        <v-btn color="error" variant="flat" @click="onNoClick">Nein</v-btn>
        <v-btn @click="onCancelClick" variant="flat">Abbrechen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>