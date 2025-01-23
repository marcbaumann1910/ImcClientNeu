<script setup>
import { defineProps } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Plugin registrieren
Chart.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

// Props für chartData und chartOptions
const props = defineProps({
  chartData: { type: Object, required: true },
  chartOptions: { type: Object, required: true }
});
</script>

<template>
  <Pie :chart-data="chartData" :options="chartOptions" />
</template>
