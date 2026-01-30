<script setup>
import { ref, computed } from "vue";
import { useDisplay } from "vuetify";
import AuthenticationService from "@/services/AuthenticationService.js";

// Dialog state
const dialog = ref(false);
const { smAndDown } = useDisplay();
const loading = ref(false);
const error = ref(null);

const memberId = ref(null);
const statusFilter = ref("alle"); // "alle" | "offen" | "abgeschlossen"

// Data
const vertraege = ref([]);

// UI helpers
const hasVertraege = computed(() => Array.isArray(vertraege.value) && vertraege.value.length > 0);

const latest = computed(() => {
  if (!hasVertraege.value) return null;
  // Backend am besten schon DESC sortiert schicken. Zur Sicherheit sortieren wir hier:
  const sorted = [...vertraege.value].sort((a, b) => new Date(b.datum) - new Date(a.datum));
  return sorted[0] ?? null;
});

const dialogProps = computed(() => ({
  fullscreen: smAndDown.value,
  maxWidth: smAndDown.value ? undefined : 700,
  scrollable: true,
}));

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function statusChipColor(status) {
  if (status === "offen") return "warning";
  if (status === "abgeschlossen") return "success";
  return "grey";
}

function statusLabel(status) {
  if (status === "offen") return "offen";
  if (status === "abgeschlossen") return "abgeschlossen";
  return status ?? "—";
}

function open(_memberId) {
  memberId.value = _memberId;
  dialog.value = true;
  loadVertraege();
}

function close() {
  dialog.value = false;
  // optional cleanup
  // memberId.value = null;
  // vertraege.value = [];
  // error.value = null;
}

async function loadVertraege() {
  if (!memberId.value) return;
  loading.value = true;
  error.value = null;

  try {
    const res = await AuthenticationService.leihvorgangGetMietvertraegeByMember({
      easyVereinMitgliedId: memberId.value,
      status: statusFilter.value,
    });

    // Erwartet: Array von { idInventarBuchungen, datum, status, artikelCount, pdfExists }
    vertraege.value = Array.isArray(res.data) ? res.data : (res.data?.vertraege ?? []);
  } catch (e) {
    console.error(e);
    error.value = "Mietverträge konnten nicht geladen werden.";
  } finally {
    loading.value = false;
  }
}

async function downloadPdf(idInventarBuchungen) {
  if (!idInventarBuchungen) return;
  try {
    // als file download (blob)
    const res = await AuthenticationService.downloadMietvertragPdf(idInventarBuchungen);
    const blob = new Blob([res.data], { type: "application/pdf" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mietvertrag_${idInventarBuchungen}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    error.value = "Download nicht möglich.";
  }
}

async function sendMail(idInventarBuchungen) {
  if (!idInventarBuchungen) return;
  try {
    await AuthenticationService.sendMietvertragMail(idInventarBuchungen);
    // optional: kleines success feedback
  } catch (e) {
    console.error(e);
    error.value = "E-Mail konnte nicht gesendet werden.";
  }
}

async function downloadLatest() {
  if (!latest.value?.idInventarBuchungen) return;
  await downloadPdf(latest.value.idInventarBuchungen);
}

async function sendLatest() {
  if (!latest.value?.idInventarBuchungen) return;
  await sendMail(latest.value.idInventarBuchungen);
}

// OPTIONAL: ZIP/Alle Download Stub
async function downloadAllZip() {
  // wenn du es implementierst:
  // const res = await AuthenticationService.downloadMietvertraegeZip(memberId.value);
  // ...
  error.value = "ZIP Download ist noch nicht implementiert.";
}

defineExpose({ open });
</script>

<template>
  <v-dialog v-model="dialog" v-bind="dialogProps">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center">
        <div>
          <div class="text-h6">Mietverträge</div>
          <div class="text-caption text-medium-emphasis">
            Mitglied-ID: {{ memberId ?? "—" }}
          </div>
        </div>

        <v-spacer />

        <v-btn
            icon="mdi-refresh"
            variant="text"
            :disabled="loading"
            @click="loadVertraege"
        />

        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div class="d-flex align-center ga-3 mb-4">
          <v-select
              v-model="statusFilter"
              :items="[
              { title: 'Alle', value: 'alle' },
              { title: 'Offen', value: 'offen' },
              { title: 'Abgeschlossen', value: 'abgeschlossen' }
            ]"
              item-title="title"
              item-value="value"
              label="Filter"
              variant="solo-filled"
              density="compact"
              style="max-width: 260px"
              :disabled="loading"
              @update:modelValue="loadVertraege"
          />

          <v-spacer />

          <v-btn
              color="primary"
              class="text-none"
              prepend-icon="mdi-file-pdf-box"
              :disabled="!latest || loading"
              @click="downloadLatest"
          >
            Neuester downloaden
          </v-btn>

          <v-btn
              color="primary"
              variant="tonal"
              class="text-none"
              prepend-icon="mdi-email-fast"
              :disabled="!latest || loading"
              @click="sendLatest"
          >
            Neuester per Mail
          </v-btn>

          <!-- Optional -->
          <v-btn
              variant="text"
              class="text-none"
              prepend-icon="mdi-archive"
              :disabled="!hasVertraege || loading"
              @click="downloadAllZip"
          >
            Alle (ZIP)
          </v-btn>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-skeleton-loader
            v-if="loading"
            type="list-item-two-line, list-item-two-line, list-item-two-line"
        />

        <div v-else>
          <v-alert v-if="!hasVertraege" type="info" variant="tonal">
            Keine Mietverträge vorhanden.
          </v-alert>

          <v-card
              v-else
              variant="outlined"
              rounded="lg"
              class="pa-0"
          >
            <!-- Scroll Container -->
            <div style="max-height: 360px; overflow: auto;">
              <v-list lines="two" density="comfortable">
                <v-list-item
                    v-for="v in vertraege"
                    :key="v.idInventarBuchungen"
                >
                  <template #prepend>
                    <v-icon
                        :icon="v.status === 'abgeschlossen' ? 'mdi-check-circle' : 'mdi-progress-clock'"
                        :color="v.status === 'abgeschlossen' ? 'success' : 'warning'"
                        class="mr-2"
                    />
                  </template>

                  <v-list-item-title class="d-flex align-center ga-2">
                    <b>#{{ v.idInventarBuchungen }}</b>
                    <v-chip
                        size="small"
                        variant="tonal"
                        :color="statusChipColor(v.status)"
                    >
                      {{ statusLabel(v.status) }}
                    </v-chip>

                    <v-chip
                        v-if="typeof v.artikelCount === 'number'"
                        size="small"
                        variant="tonal"
                        color="grey"
                    >
                      {{ v.artikelCount }} Artikel
                    </v-chip>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ formatDateTime(v.datum) }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-tooltip text="PDF herunterladen" location="top">
                      <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon="mdi-file-pdf-box"
                            variant="text"
                            color="red"
                            :disabled="v.pdfExists === false"
                            @click="downloadPdf(v.idInventarBuchungen)"
                        />
                      </template>
                    </v-tooltip>

                    <v-tooltip text="E-Mail erneut senden" location="top">
                      <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon="mdi-email-fast"
                            variant="text"
                            color="green"
                            @click="sendMail(v.idInventarBuchungen)"
                        />
                      </template>
                    </v-tooltip>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn class="text-none" variant="text" @click="close">Schließen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<style scoped>

</style>