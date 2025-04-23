<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
import Artikel from "@/components/Artikel/Artikel.vue";

function handleRowClicked(item) {
  console.log('Detailansicht öffnen für:', item);
  // Z.B. Navigation mit Vue Router:
  // router.push({ name: 'DetailAnsicht', params: { id: item.id } });
  router.push({name: 'lagerverwaltung', query: {
      IDInventarArtikel: item.IDInventarArtikel//Falls noch kein Jahr gewählt wurde, dann das aktuelle Jahr
    }});
}

</script>

<template>
  <h1>Artikelübersicht</h1>

  <div class="d-flex align-center flex-column my-2">
    <v-btn
        class="my-2"
        color="blue darken-2"
        prepend-icon="mdi-plus"
    >
      Artikel anlegen
    </v-btn>
  </div>

  <Artikel
      clickable
      :aktiv="false"
      :verleihbar="false"
      @row-clicked="handleRowClicked"
  />

</template>

<style scoped>

</style>