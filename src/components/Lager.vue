<script setup>
import Artikel from "@/components/Artikel.vue";

function handleRowClicked(item) {
  console.log('Detailansicht öffnen für:', item);
  // Z.B. Navigation mit Vue Router:
  // router.push({ name: 'DetailAnsicht', params: { id: item.id } });
}

</script>

<template>
  <h1>Lager</h1>
  <Artikel clickable />

</template>

<style scoped>

</style>