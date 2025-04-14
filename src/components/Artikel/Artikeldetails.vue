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
const artikel = ref([])
const umsatzsteuer = ref([])
const abrechnungsIntervall = ref([])
const farbe = ref([])
const kategorie = ref([])
const konfektionsGroessen = ref([])
const imageUrl = process.env.VITE_API_URL


// Referenz auf das versteckte input-Element
const fileInput = ref(null)

onMounted(async()=>{
  console.log('IDInventarArtikel::', route.query.IDInventarArtikel);
  try {
    const result = await AuthenticationService.artikel(route.query.IDInventarArtikel);
    artikel.value = result.data.artikel[0];
    umsatzsteuer.value = result.data.umsatzsteuer;
    abrechnungsIntervall.value = result.data.abrechnungsIntervall;
    farbe.value = result.data.farbe;
    kategorie.value = result.data.kategorie;
    konfektionsGroessen.value = result.data.konfektionsGroessen
    preview.value = imageUrl + artikel.value.Bildpfad;

    console.log('getArtikel', result)
  } catch (error) {
    console.error('Fehler beim getArtikel:', error)
  }
})

// Funktion, die das hidden file input klickt
function triggerFileInput() {
  fileInput.value.click()
}

// Event-Handler, um die Datei auszuwählen und eine Vorschau anzuzeigen
function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return

  // Überprüfe, ob es sich um ein Bild handelt
  if (!file.type.startsWith('image/')) {
    alert('Bitte wähle ein Bild aus.')
    return
  }
  //Übergibt den Dateinamen, wird für den Backendaufruf benötigt
  selectedFile.value = file
  // Erzeugen einer URL zur sofortigen Vorschau (alternativ FileReader verwenden)
  preview.value = URL.createObjectURL(file)
}

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

async function updateArtikel(){

  const data = {
    artikelBezeichnung: artikel.value.ArtikelBezeichnung,
    einkaufspreis: artikel.value.Einkaufspreis,
    preis: artikel.value.Preis,
    ustSatz: artikel.value.IDUmsatzsteuer,
    abrechnungIntervall: artikel.value.IDAbrechnungIntervall,
    farbe: artikel.value.Farbe,
    konfektionsgroesse: artikel.value.Konfektionsgroesse,
    kategorieBezeichnung: artikel.value.KategorieBezeichnung

  }

  console.log('artikel.value.ArtikelBezeichnung', artikel.value.ArtikelBezeichnung)

  try {
    const result = await AuthenticationService.artikelUpdate(data)
    console.log('Update Artikel', data)
  } catch (error) {
    console.error('Fehler bUpdate Artikel:', data)
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
  <h1 class="mb-5">Artikeldetails</h1>
  <!--Bild  -->
  <!-- Gesamte Zeile -->
  <v-row>
    <!-- Spalte 1: Bildauswahl -->
    <v-col cols="12" md="3">
      <!-- Wrapper-Div macht den Bereich klickbar -->
      <div class="image-picker" @click="triggerFileInput">
        <!-- Wenn ein Bild ausgewählt wurde, wird dieses als v-img angezeigt -->
        <v-img
            v-if="preview"
            :src="preview"
            contain
            height="100"
            width="100"
        ></v-img>
        <!-- Andernfalls ein Platzhalter mit Icon und Hinweistext -->
        <div v-else class="placeholder">
          <v-icon size="64">mdi-image-off</v-icon>
          <div>Bild auswählen</div>
        </div>
        <!-- Verstecktes File Input -->
        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="onFileChange"
            style="display: none"
        />
      </div>
    </v-col>
    <!-- Spalte 2: Button -->
    <v-col cols="12" md="3" class="d-flex align-center">
      <v-btn @click="uploadImage">Test Bild upload</v-btn>
      <v-btn @click="updateArtikel">Update Artikel</v-btn>

    </v-col>
    <!-- Spalte 3: Checkboxen (ggf. gruppiert in zwei Spalten) -->
    <v-col cols="12" md="6">
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-checkbox label="verleihbar"></v-checkbox>
          <v-checkbox label="aktiv"></v-checkbox>
        </v-col>
        <v-col cols="12" sm="6">
          <v-checkbox label="verkäuflich"></v-checkbox>
          <v-checkbox label="Ext. Nummer"></v-checkbox>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <div>
    <!-- Dense reduziert die Zwischenräume zwischen den Spalten -->
    <v-row dense>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-text-field v-model="artikel.ArtikelBezeichnung" placeholder="Artikelbezeichnung" class="marginTop" variant="solo-filled"></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-text-field v-model="artikel.Einkaufspreis" placeholder="Einkaufspreis" class="marginTop" variant="solo-filled"></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-text-field v-model="artikel.Preis" placeholder="Verkaufspreis" class="marginTop" variant="solo-filled"></v-text-field>
      </v-col>
    </v-row>
  </div>


  <div>
    <!-- Dense reduziert die Zwischenräume zwischen den Spalten -->
    <v-row dense>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin"
            label="Mehrwertsteuer"
            persistent-hint
            return-object
            single-line
            dense
            variant="solo-filled"
            v-model="artikel.UstSatz"
            :items="umsatzsteuer"
            :item-title="i => i.UstSatz"
            :item-value="i => i.IDUmsatzsteuer"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin"
            label="Abrechnungsintervall"
            persistent-hint
            return-object
            single-line
            dense
            variant="solo-filled"
            v-model="artikel.AbrechnungIntervall"
            :items="abrechnungsIntervall"
            :item-title="i => i.Bezeichnung"
            :item-value="i => i.IDAbrechnungIntervall"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin"
            label="Hersteller"
            persistent-hint
            return-object
            single-line
            dense
            variant="solo-filled"
        ></v-select>
      </v-col>
    </v-row>
  </div>

  <div>
    <!-- Dense reduziert die Zwischenräume zwischen den Spalten -->
    <v-row dense>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin"
            label="Farbe"
            persistent-hint
            return-object
            single-line
            dense
            variant="solo-filled"
            v-model="artikel.Farbe"
            :items="farbe"
            :item-title="i => i.Bezeichnung"
            :item-value="i => i.IDFarbe"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin"
            label="Konfekionsgröße"
            persistent-hint
            return-object
            single-line
            dense
            variant="solo-filled"
            v-model="artikel.Konfektionsgroesse"
            :items="konfektionsGroessen"
            :item-title="i => i.Konfektionsgroesse"
            :item-value="i => i.IDKonfektionsgroesse"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin"
            label="Kategorie"
            persistent-hint
            return-object
            single-line
            dense
            variant="solo-filled"
            v-model="artikel.KategorieBezeichnung"
            :items="kategorie"
            :item-title="i => i.Bezeichnung"
            :item-value="i => i.IDInventarKategorie"
        ></v-select>
      </v-col>
    </v-row>
  </div>

</template>

<style scoped>
@media (max-width: 600px) {
  .marginTop{
    margin-top: -15px !important;
  }
}

.image-picker {
  border: 1px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
  /* Feste Dimensionen, die für den gesamten Container gelten */
  width: 120px;
  height: 120px;
  /* Kein inneres Padding – so ist der Abstand zum Rahmen überall gleich */
  padding: 0;
  box-sizing: border-box;
  /* Flexbox, damit Inhalt (Bild oder Platzhalter) zentral ausgerichtet wird */
  display: flex;
  align-items: center;
  justify-content: center;
  /* 3D Effekt */
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.image-picker:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.3);
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Stelle sicher, dass der Platzhalter die volle Höhe und Breite des Containers einnimmt */
  width: 100%;
  height: 100%;
  color: #999;
}

</style>
