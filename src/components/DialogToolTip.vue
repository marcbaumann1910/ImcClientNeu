<script setup>
import { defineEmits } from 'vue';

// Definiere die Props, einschließlich `modelValue` für v-model
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  dialogTitle: {
    type: String,
    required: true,
  },
  dialogText: {
    type: String,
    required: true,
  },
});

// Definiere die Emits für die Aktualisierung des Dialog-Status
const emit = defineEmits(['update:modelValue']);

// Methode zum Schließen des Dialogs
function closeDialog(){
  emit('update:modelValue', false);
}

</script>

<template>
  <v-dialog v-model="props.modelValue" max-width="500">
    <v-card>
      <v-card-title class="headline">{{ props.dialogTitle }}</v-card-title>
      <v-card-text>
        {{ props.dialogText }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeDialog">Schließen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>
