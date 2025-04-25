<script setup>
import { useRoute } from 'vue-router'
import {onMounted, computed, ref} from "vue";
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


//Checkboxen setzen
const verleihbar = computed({
  get() {
    return artikel.value.verleihbar === 1;
  },
  set(newValue) {
    console.log("Checkbox geändert:", newValue);
    artikel.value.verleihbar = newValue ? 1 : 0;
  }
});

const aktiv = computed({
  get() {
    return artikel.value.aktiv === 1;
  },
  set(newValue) {
    console.log("Checkbox geändert:", newValue);
    artikel.value.aktiv = newValue ? 1 : 0;
  }
});

const externeNummerPflicht = computed({
  get() {
    return artikel.value.externeInventarNummerPflicht === 1;
  },
  set(newValue) {
    console.log("Checkbox geändert:", newValue);
    artikel.value.externeInventarNummerPflicht = newValue ? 1 : 0;
  }
});

const verkaufbar = computed({
  get() {
    return artikel.value.verkaufbar === 1;
  },
  set(newValue) {
    console.log("Checkbox geändert:", newValue);
    artikel.value.verkaufbar = newValue ? 1 : 0;
  }
});

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

  //Sollte das Bild nicht geändert werden, muss der Dateiname des Bildes (kommt aus dem Backend)
  //extrahiert werden
/*
  const fullPath = artikel.value.Bildpfad; // "/images/artikel/Rock.jpg"
  const imageName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
  console.log(imageName);*/

  //Wenn in v-select Mehrwertsteuer kein neuer Eintrag gewählt wird, dann
  //nehme ich die Daten aus dem Backend.
  //Wird ein neuer Eintrag aus v-select gewählt, verwende ich die IDUmsatzsteuer
  //aus dessen Objekt. Das gleiche Prinzip wende ich für die anderen v-selects an
  let idUmsatzsteuer = "";
  if (artikel.value.UstSatz && artikel.value.UstSatz.IDUmsatzsteuer) {
    idUmsatzsteuer = artikel.value.UstSatz.IDUmsatzsteuer;
    console.log('idUmsatzsteuer',idUmsatzsteuer)
  } else {
    idUmsatzsteuer = artikel.value.IDUmsatzsteuer;
    console.log('artikel.value.IDUmsatzsteuer', idUmsatzsteuer)
  }

  let idAbrechnungsIntervall = "";
  if (artikel.value.AbrechnungIntervall && artikel.value.AbrechnungIntervall.IDAbrechnungIntervall) {
    idAbrechnungsIntervall = artikel.value.AbrechnungIntervall.IDAbrechnungIntervall;
    console.log('idAbrechnungsIntervall', idAbrechnungsIntervall);
  } else {
    idAbrechnungsIntervall = artikel.value.IDAbrechnungIntervall;
    console.log('artikel.value.IDAbrechnungIntervall', idAbrechnungsIntervall);
  }

  let idFarbe = "";
  if (artikel.value.Farbe && artikel.value.Farbe.IDFarbe) {
    idFarbe = artikel.value.Farbe.IDFarbe;
    console.log('idFarbe:', idFarbe);
  } else {
    idFarbe = artikel.value.IDFarbe;
    console.log('artikel.value.IDFarbe:', idFarbe);
  }

  let idKonfektionsgroesse = "";
  if (artikel.value.Konfektionsgroesse && artikel.value.Konfektionsgroesse.IDKonfektionsgroesse) {
    idKonfektionsgroesse = artikel.value.Konfektionsgroesse.IDKonfektionsgroesse;
    console.log('idKonfektionsgroesse:', idKonfektionsgroesse);
  } else {
    idKonfektionsgroesse = artikel.value.IDKonfektionsgroesse;
    console.log('artikel.value.IDKonfektionsgroesse:', idKonfektionsgroesse);
  }

  let idInventarKategorie = "";
  if (artikel.value.KategorieBezeichnung && artikel.value.KategorieBezeichnung.IDInventarKategorie) {
    idInventarKategorie = artikel.value.KategorieBezeichnung.IDInventarKategorie;
    console.log('IDInventarKategorie:', idInventarKategorie);
  } else {
    idInventarKategorie = artikel.value.IDInventarKategorie;
    console.log('artikel.value.IDInventarKategorie:', idInventarKategorie);
  }

  console.log('verleihbar',verleihbar.value)

  //Bild-Upload, falls eines ausgewählt wurde
  let returnImagePath = "";
  if(selectedFile.value){

    //Upload muss mit FormData() erfolgen
    const formData = new FormData()
    // Verwende die reaktive Variable "selectedFile"
    formData.append('image', selectedFile.value)

    try {
      const result = await AuthenticationService.uploadImage(formData)
      //Backend liefert den Speicherort des eben hochgeladenen Bildes
      returnImagePath = result.data.imagePath
      console.log('Upload Image', result)
      console.log('returnImagePath', returnImagePath)
    } catch (error) {
      console.error('Fehler beim Upload:', error)
    }
  }

  const data = {
    idInventarArtikel: artikel.value.IDInventarArtikel,
    artikelBezeichnung: artikel.value.ArtikelBezeichnung,
    einkaufspreis: artikel.value.Einkaufspreis,
    preis: artikel.value.Preis,
    idUmsatzsteuer: idUmsatzsteuer,
    idAbrechnungsIntervall: idAbrechnungsIntervall,
    idFarbe: idFarbe,
    idKonfektionsgroesse: idKonfektionsgroesse,
    idInventarKategorie: idInventarKategorie,
    bildPfad: returnImagePath || null, //Wird Bild nicht geändert, NULL ans Backend senden!
    verleihbar: !!verleihbar.value, //Checkbox
    aktiv: !!aktiv.value, //Checkbox
    externeNummerPflicht: !!externeNummerPflicht.value, //Checkbox
    verkaufbar: !!verkaufbar.value, //Checkbox
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
<!--      <v-btn @click="uploadImage">Test Bild upload</v-btn>-->
      <v-btn @click="updateArtikel" color="success">speichern</v-btn>

    </v-col>
    <!-- Spalte 3: Checkboxen (ggf. gruppiert in zwei Spalten) -->
    <v-col cols="12" md="6">
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-checkbox v-model="verleihbar" label="verleihbar"></v-checkbox>
          <v-checkbox v-model="aktiv" label="aktiv"></v-checkbox>
        </v-col>
        <v-col cols="12" sm="6">
          <v-checkbox v-model="verkaufbar" label="verkäuflich"></v-checkbox>
          <v-checkbox v-model="externeNummerPflicht" label="Ext. Nummer"></v-checkbox>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <div>
    <!-- Dense reduziert die Zwischenräume zwischen den Spalten -->
    <v-row dense>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-text-field v-model="artikel.ArtikelBezeichnung" placeholder="Artikelbezeichnung" label="Artikel Bezeichnung" class="marginTop" variant="solo-filled"></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-text-field
            class="marginTop no-spinner"
            v-model.number="artikel.Einkaufspreis"
            label="Einkaufspreis"
            placeholder="0,00"
            suffix=" €"
            type="number"
            step="0.01"
            variant="solo-filled"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-text-field v-model="artikel.Preis" placeholder="0,00 €" label="Verkaufspreis" class="marginTop" variant="solo-filled"></v-text-field>
      </v-col>
    </v-row>
  </div>


  <div>
    <!-- Dense reduziert die Zwischenräume zwischen den Spalten -->
    <v-row dense>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin pt-4"
            v-model="artikel.IDUmsatzsteuer"
            :items="umsatzsteuer"
            item-title="UstSatz"
            item-value="IDUmsatzsteuer"
            label="Mehrwertsteuer"
            dense
            variant="solo-filled"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin pt-4"
            v-model="artikel.IDAbrechnungIntervall"
            :items="abrechnungsIntervall"
            item-title="Bezeichnung"
            item-value="IDAbrechnungIntervall"
            label="Abrechnungsintervall"
            dense
            variant="solo-filled"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin pt-4"
            item-title="Bezeichnung"
            item-value="IDFarbe"
            label="Hersteller"
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
            class="mobile-text-small mt-0 mb-0 custom-no-margin pt-4"
            v-model="artikel.IDFarbe"
            :items="farbe"
            item-title="Bezeichnung"
            item-value="IDFarbe"
            label="Farbe"
            dense
            variant="solo-filled"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin pt-4"
            v-model="artikel.IDKonfektionsgroesse"
            :items="konfektionsGroessen"
            item-title="Konfektionsgroesse"
            item-value="IDKonfektionsgroesse"
            label="Konfektionsgröße"
            dense
            variant="solo-filled"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-start">
        <v-select
            class="mobile-text-small mt-0 mb-0 custom-no-margin pt-4"
            v-model="artikel.IDInventarKategorie"
            :items="kategorie"
            item-title="Bezeichnung"
            item-value="IDInventarKategorie"
            label="Kategorie"
            dense
            variant="solo-filled"
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

/* Versteckt die Number-Spinner */
.no-spinner input::-webkit-outer-spin-button,
.no-spinner input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.no-spinner input[type=number] { -moz-appearance: textfield; }

</style>
