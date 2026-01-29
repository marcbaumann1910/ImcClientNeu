<script setup>
import {computed, ref} from 'vue'
import PieChart from '@/components/PieChart.vue'
import { onMounted } from "vue";
import AuthenticationService from "@/services/AuthenticationService.js";
import {formatDate} from "@/scripte/globalFunctions.js";
import * as globalFunction from "../scripte/globalFunctions.js";
const chartDataBackend = ref([]);
const neuesteVorgaenge = ref([]);
const lagerbestand = ref([]);

onMounted(async () => {
  try {

    //Vom Backend werden 'leihvorgaenge', 'neuesteVorgaenge', 'lagerbestand' abgerufen
    const response = await AuthenticationService.dashboardLeihvorgaenge()
    //Daten vom Backend --> Anzahl in eine Zahl wandeln, damit dies in Prozent umgerechnet werden können
    chartDataBackend.value = response.data.leihvorgaenge.map(item => {
      return {
        Bezeichnung: item.Bezeichnung,
        Anzahl: parseFloat(item.Anzahl),
      }
    })
    neuesteVorgaenge.value = response.data.neuesteVorgaenge
    lagerbestand.value = response.data.lagerbestand

    console.log('Dashboard Leihvoränge erfolgreich abrufen')
  }catch (err) {
    console.log('FEHLER: Dashboard Leihvoränge', err.message)
  }
})

/**
 * Daten (labels, datasets) für ein Pie-Chart
 */
const chartData = computed(() => {
  if (!chartDataBackend.value || chartDataBackend.value.length === 0) {
    return {
      labels: [],
      datasets: [{ data: [] }]
    };
  }
  const labels = chartDataBackend.value.map(item => item.Bezeichnung);
  const data = chartDataBackend.value.map(item => item.Anzahl);
  const backgroundColor = ['#F44336', '#4CAF50', '#FFC107', '#2196F3'];

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        label: 'Leihstatus'
      }
    ]
  };
});

/**
 * Optionen (Optionen für Legende, Title etc.)
 */
const chartOptions = ref({
  responsive: true,
  plugins: {
    //legend: { position: 'top' },
    datalabels: {
      color: '#fff',
      font: { weight: 'bold' },
      formatter: (value, context) => {
        console.log('formatter -> value:', value)
        const dataArr = context.chart.data.datasets[0].data
        const total = dataArr.reduce((acc, val) => acc + val, 0)
        const percentage = ((value / total) * 100).toFixed(1)
        return `${value} (${percentage}%)`
      }
    }
  }
})


</script>

<template>
<v-container>

  <div class="dashboard-background">
    <h1>Dashboard</h1>
  </div>

      <v-row>
        <!--Leihvorgänge Pie (Kreisdiagramm)-->
        <v-col cols="12" sm="6" md="4">
          <v-card  max-width="500" max-height="550">
            <v-card-title>Leihvorgänge</v-card-title>
            <PieChart class="mb-2" :chart-data="chartData" :chart-options="chartOptions" />
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">

        <!--Aktuellsten Leihvorgänge-->
          <v-card  max-width="500" max-height="550">
            <v-card-title>aktuelle Leihvorgänge</v-card-title>

            <v-list>
              <v-list-item
                  v-for="(item, index) in neuesteVorgaenge"
                  :key="index"
              >
                <v-row no-gutters align="start">
                  <v-col cols="12" sm="6" md="4">
                    <v-list-item-title>
                      {{ item.firstName }}
                    </v-list-item-title>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-list-item-title>
                      {{ item.familyName }}
                    </v-list-item-title>
                  </v-col>
<!--                  <v-col cols="12" sm="6" md="4">
                    <v-list-item-title>
                      {{ item.city }}
                    </v-list-item-title>
                  </v-col>-->
                  <v-col cols="12" sm="6" md="4">
                    <v-list-item-title>
                      {{ globalFunction.formatDate(item.DatumBuchung) }}
                    </v-list-item-title>
                  </v-col>

                </v-row>
                <v-divider></v-divider>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>


      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-card>
            <v-card-title>Kachel 3</v-card-title>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card>
            <v-card-title>Kachel 4</v-card-title>
          </v-card>
        </v-col>
      </v-row>


    </v-container>

</template>

<style scoped>

</style>




