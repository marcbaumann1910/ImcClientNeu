  <script setup>
import { useRoute } from 'vue-router'
import {onMounted, computed, ref, watch} from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";
const route = useRoute()
const selectedFile = ref(null)
const preview = ref(null)
const artikel = ref(null)
const artikelOriginal = ref(null)
const umsatzsteuer = ref([])
const abrechnungsIntervall = ref([])
const farbe = ref([])
const kategorie = ref([])
const konfektionsGroessen = ref([])
const saveState = ref('idle') // idle | dirty | saving | success | error
const formRef = ref(null)
const snackbar = ref(false);
const snackbarText = ref('')
const snackbarColor = ref('error');
const snackbarTimeoutOverride = ref(null); // null = kein Override
const snackbarTimeout = computed(() => {
  // Wenn Override gesetzt ist, gilt der Wert
  if (snackbarTimeoutOverride.value !== null) return snackbarTimeoutOverride.value;

  // Sonst Standardregel
  return snackbarColor.value === 'error' ? -1 : 5000;
});
const einkaufspreisInput = ref('') // string fürs Feld
const verkaufspreisInput = ref('') // string fürs Feld

// ##########################################################################################
//Bilderpfad bauen, damit dieser auch auf den Subdomains läuft                             #
const apiBase = import.meta.env.VITE_API_URL;            // https://test.mbdevelop.de/api#
const origin  = apiBase.replace(/\/api\/?$/, "");        // https://test.mbdevelop.de    #
const imageUrl = `${origin}`;                            // <- für Artikelbilder  #
//##########################################################################################

// Referenz auf das versteckte input-Element
const fileInput = ref(null)

//Textfelder / Selects / Switches ändern artikel.value → artikelChanged = true
//Bild gewählt → selectedFile.value ist gesetzt → imageChanged = true
//Button wird sofort aktiv
const isDirty = computed(() => {
  if (!artikel.value || !artikelOriginal.value) return false;

  const artikelChanged =
      JSON.stringify(artikel.value) !== JSON.stringify(artikelOriginal.value);

  const imageChanged = !!selectedFile.value; // sobald neues Bild gewählt

  return artikelChanged || imageChanged;
});


//Überwacht, ob sich am Artikel etwas verändert hat, wenn ja, wird der Button speichern
//freigegeben!
watch(isDirty, (d) => {
  // sobald etwas geändert wird: dirty
  if (d) saveState.value = 'dirty'
  // wenn wieder sauber (z.B. nach save): idle
  else if (saveState.value !== 'saving') saveState.value = 'idle'
}, { immediate: true })


onMounted(async()=>{
  console.log('IDInventarArtikel::', route.query.IDInventarArtikel);
  try {
    const result = await AuthenticationService.artikel(route.query.IDInventarArtikel);
    artikel.value = result.data.artikel[0];
    artikel.value.Einkaufspreis = toDeDecimalString(artikel.value.Einkaufspreis)
    artikel.value.Preis = toDeDecimalString(artikel.value.Preis)
    umsatzsteuer.value = result.data.umsatzsteuer;
    abrechnungsIntervall.value = result.data.abrechnungsIntervall;
    farbe.value = result.data.farbe;
    kategorie.value = result.data.kategorie;
    konfektionsGroessen.value = result.data.konfektionsGroessen
    preview.value = imageUrl + artikel.value.Bildpfad;

    //
    artikelOriginal.value = deepClone(artikel.value)

    console.log('getArtikel', result)
  } catch (error) {
    console.error('Fehler beim getArtikel:', error)
  }
})

//Wird benötigt, um zu prüfen, ob sich etwas am Artikel geändert hat
//Button speichern kann dann freigegeben werden
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

//Checkboxen setzen
const verleihbar = computed({
  get() {
    return !!artikel.value && artikel.value.verleihbar === 1;;
  },
  set(newValue) {
    console.log("Checkbox geändert:", newValue);
    artikel.value.verleihbar = newValue ? 1 : 0;
  }
});

const aktiv = computed({
  get() {
    return !!artikel.value && artikel.value.aktiv === 1;
  },
  set(newValue) {
    console.log("Checkbox geändert:", newValue);
    artikel.value.aktiv = newValue ? 1 : 0;
  }
});

const externeNummerPflicht = computed({
  get() {
    return !!artikel.value && artikel.value.externeInventarNummerPflicht === 1;
  },
  set(newValue) {
    console.log("Checkbox geändert:", newValue);
    artikel.value.externeInventarNummerPflicht = newValue ? 1 : 0;
  }
});

const verkaufbar = computed({
  get() {
    return !!artikel.value && artikel.value.verkaufbar === 1;
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
    saveState.value = 'error'
    snackbarColor.value = 'error'
    snackbarText.value = 'Es muss ein Bild ausgewählt werden.'
    snackbar.value = true
    return
  }
  //Übergibt den Dateinamen, wird für den Backendaufruf benötigt
  selectedFile.value = file
  // Erzeugen einer URL zur sofortigen Vorschau (alternativ FileReader verwenden)
  preview.value = URL.createObjectURL(file)

  markDirty() // <- wichtig!
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

async function saveNow() {
  if (!artikel.value) return;

  // 1) Frontend-Validation
  const { valid } = await formRef.value?.validate()
  if (!valid) {
    snackbarColor.value = 'error'
    snackbarText.value = 'Bitte Pflichtfelder ausfüllen.'
    snackbar.value = true
    return
  }

  if (!isDirty.value) return;

  saveState.value = "saving";
  try {
    await updateArtikel();
    artikelOriginal.value = deepClone(artikel.value); // dirty reset
    selectedFile.value = null;   // <- wichtig
    saveState.value = "success";
    snackbarColor.value = 'success'
    snackbarText.value = 'Erfolgreich gespeichert.'
    snackbar.value = true
    setTimeout(() => {
      if (saveState.value === "success") saveState.value = "idle";
    }, 1500);
  } catch (error) {
    saveState.value = "error";
    snackbarColor.value = 'error'
    snackbarText.value = 'Speichern fehlgeschlagen.'
    snackbar.value = true
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
    einkaufspreis: normalizePrice(artikel.value.Einkaufspreis),
    preis: normalizePrice(artikel.value.Preis),
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
      const resultData = result.data
      console.log('Update Artikel erfolgreich', resultData.message)
  } catch (error) {
      console.error('Fehler bUpdate Artikel:')
      throw error
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

// Standard: Pflichtfeld
const req = (msg = 'Pflichtfeld') => (v) => {
  // Für v-select kann v ein Number sein -> 0 wäre auch ein Wert (selten), deshalb hier:
  return v !== null && v !== undefined && String(v).trim() !== '' || msg
}

function formatDE(num) {
  // optional: auf 2 Nachkommastellen in DE-Optik
  const n = Number(num)
  if (!Number.isFinite(n)) return ''
  return n.toFixed(2).replace('.', ',')
}

function normalizePrice(v) {
  if (v === null || v === undefined || v === '') return null
  return Number(String(v).replace(',', '.'))
}

const required = v => !!v || 'Pflichtfeld'
const decimal = v =>
    /^(\d+([.,]\d{1,2})?)$/.test(v) || 'Ungültige Zahl'

function markDirty() {
  saveState.value = 'dirty'
}

function toDeDecimalString(v) {
  if (v === null || v === undefined || v === '') return ''
  // 9.5 -> "9,5" / 9.51 -> "9,51"
  return String(v).replace('.', ',')
}

</script>

  <template>

    <v-snackbar
        v-model="snackbar"
        multi-line
        location="top"
        :timeout="snackbarTimeout"
        :color="snackbarColor"
    >
      {{ snackbarText }}

      <template v-slot:actions >
        <v-btn
            color="black"
            variant="text"
            @click="snackbar = false"
            style="background-color: white; text-transform: none;"
        >
          Schließen
        </v-btn>
      </template>

    </v-snackbar>

    <v-container class="py-6" fluid>
      <div v-if="!artikel">
        <v-skeleton-loader type="article, actions" />
      </div>
        <!-- Header -->
      <template v-else>
      <v-card class="mb-6" rounded="xl" elevation="2">
        <v-card-title class="d-flex align-center">
          <div>
            <div class="text-h5 font-weight-bold">Artikeldetails</div>
            <div class="text-caption text-medium-emphasis">
              {{ artikel?.ArtikelBezeichnung || '—' }} • ID {{ artikel?.IDInventarArtikel || '—' }}
            </div>
          </div>
          <v-spacer />

          <!-- Header Button NUR Desktop -->
          <v-btn
              v-if="$vuetify.display.mdAndUp"
              color="success"
              size="large"
              class="text-none"
              prepend-icon="mdi-content-save"
              :disabled="!isDirty || saveState === 'saving'"
              :loading="saveState === 'saving'"
              @click="saveNow"
          >
            Speichern
          </v-btn>

        </v-card-title>
      </v-card>

        <v-form ref="formRef" validate-on="submit">

        <v-row>
        <!-- LEFT: Bild + Status -->
        <v-col cols="12" md="4">
          <v-card rounded="xl" elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center">
              Bild
              <v-spacer />
              <v-btn icon="mdi-camera" variant="text" @click="triggerFileInput" />
            </v-card-title>


            <v-card-text>
              <div class="d-flex justify-center">
                <v-img
                    v-if="preview"
                    :src="preview"
                    height="220"
                    max-width="220"
                    cover
                    class="rounded-xl elevation-3"
                />
                <div v-else class="image-placeholder rounded-xl">
                  <v-icon size="48" class="mb-2">mdi-image-off</v-icon>
                  <div class="text-caption">Bild auswählen</div>
                </div>
              </div>

              <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
                  style="display:none"
              />
            </v-card-text>

            <v-divider />

            <v-card-text>
<!--              <div class="text-subtitle-2 mb-2">Status</div>

              <div class="d-flex flex-wrap ga-2">
                <v-chip :color="verleihbar ? 'success' : 'grey'" variant="tonal">
                  <v-icon start>mdi-handshake</v-icon> verleihbar
                </v-chip>

                <v-chip :color="verkaufbar ? 'success' : 'grey'" variant="tonal">
                  <v-icon start>mdi-cash</v-icon> verkäuflich
                </v-chip>

                <v-chip :color="aktiv ? 'success' : 'grey'" variant="tonal">
                  <v-icon start>mdi-check-decagram</v-icon> aktiv
                </v-chip>

                <v-chip :color="externeNummerPflicht ? 'warning' : 'grey'" variant="tonal">
                  <v-icon start>mdi-pound</v-icon> Ext. Nummer
                </v-chip>
              </div>

              <v-divider class="my-4" />-->

              <div class="text-subtitle-2 mb-2">Einstellungen</div>
              <v-switch v-model="verleihbar" label="verleihbar" color="primary" inset hide-details />
              <v-switch v-model="verkaufbar" label="verkaufbar" color="primary" inset hide-details />
              <v-switch v-model="aktiv" label="aktiv" color="primary" inset hide-details />
              <v-switch v-model="externeNummerPflicht" color="primary" label="Externe Nummer Pflicht" inset hide-details />
            </v-card-text>
          </v-card>
        </v-col>
        <!-- RIGHT: Formular -->
        <v-col cols="12" md="8">
          <v-card rounded="xl" elevation="2" class="mb-4">
            <v-card-title>Basisdaten</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                      v-model="artikel.ArtikelBezeichnung"
                      label="Artikelbezeichnung"
                      variant="solo-filled"
                      prepend-inner-icon="mdi-tag"
                      :rules="[req('Artikelbezeichnung ist Pflicht')]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                      v-model="artikel.IDInventarKategorie"
                      :items="kategorie"
                      item-title="Bezeichnung"
                      item-value="IDInventarKategorie"
                      label="Kategorie"
                      variant="solo-filled"
                      :rules="[req('Kategorie ist Pflicht')]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                      v-model="artikel.IDKonfektionsgroesse"
                      :items="konfektionsGroessen"
                      item-title="Konfektionsgroesse"
                      item-value="IDKonfektionsgroesse"
                      label="Konfektionsgröße"
                      variant="solo-filled"
                      :rules="[req('Konfektionsgröße ist Pflicht')]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                      v-model="artikel.IDFarbe"
                      :items="farbe"
                      item-title="Bezeichnung"
                      item-value="IDFarbe"
                      label="Farbe"
                      variant="solo-filled"
                      :rules="[req('Farbe ist Pflicht')]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                      v-model="artikel.IDAbrechnungIntervall"
                      :items="abrechnungsIntervall"
                      item-title="Bezeichnung"
                      item-value="IDAbrechnungIntervall"
                      label="Abrechnungsintervall"
                      variant="solo-filled"
                      :rules="[req('Abrechnungsintervall ist Pflicht')]"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card rounded="xl" elevation="2">
            <v-card-title>Preise & Steuer</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="4">
                  <v-text-field
                      v-model="artikel.Einkaufspreis"
                      label="Einkaufspreis"
                      placeholder="z.B. 10,50"
                      variant="solo-filled"
                      inputmode="decimal"
                      append-inner-icon="mdi-currency-eur"
                      @input="markDirty"
                      :rules="[required, decimal]"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                      v-model="artikel.Preis"
                      label="Verkaufspreis"
                      variant="solo-filled"
                      placeholder="z.B. 10,50"
                      inputmode="decimal"
                      append-inner-icon="mdi-currency-eur"
                      @input="markDirty"
                      :rules="[required, decimal]"
                  />

                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                      v-model="artikel.IDUmsatzsteuer"
                      :items="umsatzsteuer"
                      item-title="UstSatz"
                      item-value="IDUmsatzsteuer"
                      label="Mehrwertsteuer"
                      variant="solo-filled"
                      :rules="[req('Mehrwertsteuer ist Pflicht')]"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
        </v-form>
        <!-- Sticky Bar NUR Mobile -->
        <v-footer
            v-if="$vuetify.display.smAndDown && (isDirty || saveState === 'saving' || saveState === 'success' || saveState === 'error')"
            app
            class="pa-0"
            style="background: rgba(255,0,0,0.08); z-index: 9999;"
        >
          <v-card class="mx-4 my-3 pa-3 w-100" elevation="10">
            <div class="d-flex align-center">
              <!-- Status links -->
              <div class="text-body-2">
                <span v-if="saveState === 'dirty'">Ungespeicherte Änderungen</span>
                <span v-else-if="saveState === 'saving'">Speichere…</span>
                <span v-else-if="saveState === 'success'">Erfolgreich gespeichert</span>
                <span v-else-if="saveState === 'error'">Fehler beim Speichern</span>
                <span v-else>Alles gespeichert</span>
              </div>
              <v-spacer />
              <v-btn
                  color="success"
                  class="text-none"
                  prepend-icon="mdi-content-save"
                  :disabled="!isDirty || saveState === 'saving'"
                  :loading="saveState === 'saving'"
                  @click="saveNow"
              >
                Speichern
              </v-btn>
              <!-- success icon rechts -->
              <v-icon v-if="saveState === 'success'" class="ml-3" color="success">mdi-check-circle</v-icon>
              <v-icon v-else-if="saveState === 'error'" class="ml-3" color="error">mdi-alert-circle</v-icon>
            </div>
          </v-card>
        </v-footer>

      </template>
    </v-container>
  </template>

  <style scoped>
  .image-placeholder{
    width:220px;
    height:220px;
    border:1px dashed rgba(0,0,0,.25);
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:column;
    color:rgba(0,0,0,.5);
  }
  </style>

