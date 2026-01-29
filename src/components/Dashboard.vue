<script setup>
import { ref } from 'vue';

// Mock Daten für das Design-Beispiel
const stats = ref([
  {
    title: 'Gesamt Artikel',
    value: '1.248',
    icon: 'mdi-package-variant',
    color: 'blue',
    trendIcon: 'mdi-arrow-up',
    trendText: '+12 diese Woche',
    trendColor: 'text-success'
  },
  {
    title: 'Aktive Leihen',
    value: '84',
    icon: 'mdi-handshake',
    color: 'green',
    trendIcon: 'mdi-trending-up',
    trendText: 'Hohe Auslastung',
    trendColor: 'text-info'
  },
  {
    title: 'Überfällig',
    value: '7',
    icon: 'mdi-clock-alert-outline',
    color: 'red',
    trendIcon: 'mdi-alert-circle',
    trendText: 'Handlung erforderlich',
    trendColor: 'text-error'
  },
  {
    title: 'Inventarwert',
    value: '42.500 €',
    icon: 'mdi-currency-eur',
    color: 'orange',
    trendIcon: 'mdi-minus',
    trendText: 'Stabil',
    trendColor: 'text-grey'
  }
]);

const activities = ref([
  {
    user: 'Marc Baumann',
    action: 'Leihvorgang #4203 abgeschlossen',
    time: 'vor 5 Min.',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg'
  },
  {
    user: 'System',
    action: 'Lagerbestand "Kabeltrommel" niedrig',
    time: 'vor 1 Std.',
    avatar: 'https://cdn.vuetifyjs.com/images/logos/v-alt.svg'
  },
  {
    user: 'Julia Schmidt',
    action: 'Neuer Artikel "Beamer LG" angelegt',
    time: 'vor 3 Std.',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg'
  },
  {
    user: 'Thomas Müller',
    action: 'Mitgliedsprofil aktualisiert',
    time: 'vor 5 Std.',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg'
  },
  {
    user: 'Marc Baumann',
    action: 'Inventurliste exportiert',
    time: 'vor 1 Tag',
    avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg'
  }
]);
</script>



<template>
  <v-container fluid class="pa-6 bg-grey-lighten-4 fill-height">
    <!-- Header Bereich -->
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">Dashboard Übersicht</h1>
          <p class="text-subtitle-1 text-grey-darken-1">Willkommen zurück! Hier ist der aktuelle Status Ihres Inventars.</p>
        </div>
        <v-btn icon="mdi-bell-outline" variant="text" color="grey-darken-1"></v-btn>
      </v-col>
    </v-row>

    <!-- KPI Sektion -->
    <v-row>
      <v-col v-for="(stat, i) in stats" :key="i" cols="12" sm="6" lg="3">
        <v-card elevation="2" class="rounded-lg pa-4 border-s-xl" :style="{ borderLeftColor: stat.color + ' !important' }">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-overline mb-1 text-grey-darken-1">{{ stat.title }}</div>
              <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
              <div class="text-caption mt-1" :class="stat.trendColor">
                <v-icon size="x-small">{{ stat.trendIcon }}</v-icon> {{ stat.trendText }}
              </div>
            </div>
            <v-avatar :color="stat.color + '-lighten-4'" size="56" rounded="lg">
              <v-icon :color="stat.color" size="32">{{ stat.icon }}</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Schnellzugriff & Aktionen -->
    <v-row class="mt-6">
      <v-col cols="12" md="8">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="pa-4 font-weight-bold border-bottom d-flex align-center">
            <v-icon start color="primary">mdi-lightning-bolt</v-icon>
            Schnellzugriff
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" sm="6">
                <v-btn
                  block
                  height="100"
                  color="primary"
                  variant="elevated"
                  class="rounded-xl flex-column"
                  @click="$router.push('/leihvorgang')"
                >
                  <v-icon size="32" class="mb-2">mdi-cart-plus</v-icon>
                  <span>Neuer Leihvorgang</span>
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn
                  block
                  height="100"
                  color="secondary"
                  variant="tonal"
                  class="rounded-xl flex-column"
                  @click="$router.push('/artikel')"
                >
                  <v-icon size="32" class="mb-2">mdi-package-variant-plus</v-icon>
                  <span>Artikel anlegen</span>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Platzhalter für Chart -->
            <div class="mt-8">
              <div class="text-subtitle-1 font-weight-bold mb-4">Leihaktivität (7 Tage)</div>
              <v-sheet height="200" color="grey-lighten-3" class="rounded-lg d-flex align-center justify-center border-dashed border-thin">
                <div class="text-center text-grey">
                  <v-icon size="48" class="mb-2">mdi-chart-line</v-icon>
                  <div>[ Chart Integration: Leihvorgänge pro Tag ]</div>
                </div>
              </v-sheet>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="pa-4 font-weight-bold border-bottom d-flex align-center">
            <v-icon start color="orange-darken-2">mdi-history</v-icon>
            Letzte Aktivitäten
          </v-card-title>
          <v-divider></v-divider>
          <v-list lines="two" class="pa-0">
            <v-list-item
              v-for="(activity, i) in activities"
              :key="i"
              :prepend-avatar="activity.avatar"
              :title="activity.user"
              :subtitle="activity.action"
              class="border-bottom pa-4"
            >
              <template v-slot:append>
                <div class="text-caption text-grey">{{ activity.time }}</div>
              </template>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-card-actions class="justify-center">
            <v-btn variant="text" color="primary">Alle Aktivitäten anzeigen</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}
.border-dashed {
  border-style: dashed !important;
}
.border-thin {
  border-width: 2px !important;
}
</style>
