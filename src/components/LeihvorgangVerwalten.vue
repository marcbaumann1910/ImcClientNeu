<script setup>

</script>

<template>
  <h1>LeihvorgangVerwalten</h1>

  <div>
    <div class="text-subtitle-2 mb-2">Aktuelle Leihvorgänge</div>
    <v-expansion-panels>
      <v-expansion-panel
          v-for="i in 3"
          :key="i"
          text="Artikel"
          title="Mitgliedsname"
      >
        <v-expansion-panel-text>
        <v-list>
          <v-list-item v-for="(item, index) in 3" :key="index">
            <v-list-item-title>Title</v-list-item-title>
            <v-list-item-subtitle>Subtitle</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>

</template>

<style scoped>

</style>