<script setup>
import { computed, ref, watch } from "vue";
import { useDisplay } from "vuetify";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  memberName: { type: String, default: "" },
  initialEmail: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  required: { type: Boolean, default: true },
  idMitglied: { type: [String, Number], required: true }
});

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);

const email = ref("");

watch(
    () => props.modelValue,
    (open) => {
      if (open) {
        email.value = props.initialEmail || "";
      }
    }
);

const rules = [
  (v) => !!v || "Bitte E-Mail eingeben.",
  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "")) || "Bitte eine gültige E-Mail eingeben.",
];

function onSave() {
  // simple front validation; backend does strict validation
  console.log("email", email.value);
  console.log("IDMitglied", props.idMitglied);
  const v = email.value?.trim();
  if (!v) return;
  emit("save", v);                 // <--- nur String
  emit("update:modelValue", false) // <--- optional direkt schließen
}

function onCancel() {
  emit("cancel");
  emit("update:modelValue", false);
}
</script>

<template>
  <component
      :is="isMobile ? 'v-bottom-sheet' : 'v-dialog'"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :persistent="required"
      :max-width="640"
  >
    <v-card class="pa-4" rounded="xl">
      <v-card-title class="text-h6">
        E-Mail-Adresse fehlt
      </v-card-title>

      <v-card-text>
        <div class="mb-3">
          Für den nächsten Schritt brauchen wir eine E-Mail-Adresse für
          <strong>{{ memberName }}</strong>.
        </div>

        <v-text-field
            v-model="email"
            label="E-Mail-Adresse"
            type="email"
            autocomplete="email"
            :rules="rules"
            :disabled="loading"
            clearable
            autofocus
            @keyup.enter="onSave"
        />
        <div class="text-caption text-medium-emphasis">
          Wir speichern die Adresse direkt beim Mitglied (easyVerein).
        </div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" :disabled="loading" @click="onCancel">
          {{ required ? 'Abbrechen' : 'Später' }}
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="onSave">
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </component>
</template>

<style>

</style>