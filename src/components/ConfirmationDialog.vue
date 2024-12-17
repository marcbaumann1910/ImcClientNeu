<script setup>
import { ref } from 'vue';

const show = ref(false);

function openDialog() {
  show.value = true;
}

function closeDialog() {
  show.value = false;
}

function onYesClick() {
  closeDialog();
  // Emitte das Ergebnis "yes"
  // Die aufrufende Komponente kann darauf reagieren
  emit('confirm', 'yes');
}

function onNoClick() {
  closeDialog();
  emit('confirm', 'no');
}

function onCancelClick() {
  closeDialog();
  emit('confirm', 'cancel');
}

const emit = defineEmits(['confirm']);

// Mache openDialog von außen aufrufbar
defineExpose({ openDialog });
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