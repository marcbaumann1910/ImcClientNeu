<script setup>
import { ref, computed, onMounted } from 'vue'
import AuthenticationService from "@/services/AuthenticationService.js";
const search = ref('');
const members = ref([]);

defineProps({
  member: Object,
})

onMounted(async ()  => {
  try {
    const response = await AuthenticationService.mitglieder()
    members.value = response.data;
  }catch(err)
  {
    console.log('Fehler beim abrufen der Mitglieder', err)
  }
})

const filteredMembers = computed(() => {
  if(search.value.length < 3){
    return [];
  }

  //Filtern der Mitglieder
  return members.value
      .filter((member) => {
    const searchString = `${member.firstName} ${member.familyName}`;//Kombinierte Suche
    return searchString.toLowerCase().includes(search.value.toLowerCase());
  })
    .sort((a, b) => {
      const lastNameComparison = a.familyName.localeCompare(b.familyName);
      if (lastNameComparison !== 0) {
        return lastNameComparison;
      }
      return a.firstName.localeCompare(b.firstName);
  });

})

</script>

<template>
  <v-container>
    <v-row justify="center">
    <v-col cols="12" md="8" lg="8">
      <v-card class="d-flex align-center pe-2 mb-6">
        <v-icon class="ml-2">mdi-account-multiple</v-icon>
        <v-card-title>Mitglied suchen</v-card-title>
        <v-spacer></v-spacer>

    </v-card>
      <!-- Suchfeld -->
      <v-text-field
          v-model="search"
          class="search-field mb-4"
          label="Suche Mitglieder"
          prepend-inner-icon="mdi-magnify"
          clearable
          @click:clear="search = ''"
      variant="solo-filled"
      hide-details
      single-line
      ></v-text-field>

      <div v-for="member in filteredMembers" :key="member.id">
      <v-hover v-slot="{ isHovering, props }">
        <!-- $emit('memberSelected', member)" ÜBERGIBT das Element an die übergeordnete Komponente, hier dem Leihvorgang-->
      <v-card
          class="mb-2"
          @click="$emit('memberSelected', member)"
          v-bind="props"
          :elevation="isHovering ? 10 : 2"
          :color="isHovering ? 'primary' : 'white'"
      >
        <v-card-title>{{member.firstName}} {{member.familyName}}</v-card-title>
        <v-card-subtitle>{{member.city}}</v-card-subtitle>
      </v-card>
      </v-hover>
      </div>
    </v-col>
    </v-row>
  </v-container>

</template>

<style scoped>

</style>