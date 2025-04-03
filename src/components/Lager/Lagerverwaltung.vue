<script setup>
import { useRoute } from 'vue-router'
import {onMounted, watch, ref} from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";
const route = useRoute()
const valid = ref(false)
const firstname = ref('')
const lastname = ref('')
const email = ref('')
const files = ref(null)
const selectedFile = ref(null)
const preview = ref(null)

onMounted(()=>{
  console.log('IDInventarArtikel::', route.query.IDInventarArtikel);
})

// Event-Handler für Bildauswahl
watch(files, (newVal) => {
  if (!newVal) return
  // Falls newVal ein Array ist (z.B. bei multiple-Dateiauswahl), nimm das erste Element:
  const file = Array.isArray(newVal) ? newVal[0] : newVal

  // Speichere das File in der reaktiven Variable, damit es auch außerhalb verfügbar ist
  selectedFile.value = file

  // Debug-Ausgabe, um den File-Inhalt zu prüfen
  console.log('Gewähltes File:', file)

  // Überprüfen, ob file.type existiert und mit "image/" beginnt
  if (!file.type || !file.type.startsWith('image/')) {
    alert('Bitte wählen Sie ein Bild aus.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    preview.value = e.target.result
  }
  reader.readAsDataURL(file)
})

async function uploadImage() {
  if (!selectedFile.value) {
    alert('Bitte wählen Sie ein Bild aus!')
    return
  }
  //Upload muss mit FormData() erfolgen
  const formData = new FormData()
  // Verwende die reaktive Variable "selectedFile"
  formData.append('image', selectedFile.value)

  // Falls du weitere Daten senden möchtest, z.B. Artikelbezeichnung oder Stückzahl:
  // formData.append('articleName', articleName.value)
  // formData.append('quantity', quantity.value)

  try {
    const result = await AuthenticationService.uploadImage(formData)
    console.log('Upload Image', result)
  } catch (error) {
    console.error('Fehler beim Upload:', error)
  }
}

const nameRules = [
  (value) => {
    if (value) return true
    return 'Name is required.'
  },
  (value) => {
    if (value?.length <= 10) return true
    return 'Name must be less than 10 characters.'
  }
]

const emailRules = [
  (value) => {
    if (value) return true
    return 'E-mail is required.'
  },
  (value) => {
    if (/.+@.+\..+/.test(value)) return true
    return 'E-mail must be valid.'
  }
]

</script>

<template>
  <h1 class="mb-5">Lagerverwaltung</h1>


  <div>
    <!-- Dense reduziert die Zwischenräume zwischen den Spalten -->
    <v-row dense>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-text-field class="marginTop" variant="solo-filled">Bezeichnung</v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-text-field class="marginTop" variant="solo-filled">Bezeichnung</v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-text-field class="marginTop" variant="solo-filled">Bezeichnung</v-text-field>
      </v-col>
    </v-row>
  </div>

  <!--Bild  -->
  <div>

    <v-row>
      <v-col cols="12" sm="6" md="4">
        <!-- Vorschau des ausgewählten Bildes -->
        <v-avatar size="128px" rounded="0" class="">
          <template v-if="preview">
            <v-img alt="Avatar" :src="preview" contain></v-img>
          </template>
          <template v-else>
            <v-icon size="128px">mdi-image-off-outline</v-icon>
          </template>
        </v-avatar>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-file-input
            v-model="files"
            accept="image/*"
            label="Bild auswählen"
            prepend-icon="mdi-image"
            truncate-length="20"
            hide-details
        />
      </v-col>

      <v-btn @click="uploadImage" >Test Bild upload</v-btn>
    </v-row>



  </div>

</template>

<style scoped>
@media (max-width: 600px) {
  .marginTop{
    margin-top: -15px !important;
  }
}
</style>
