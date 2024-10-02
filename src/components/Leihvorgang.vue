<script setup>
import { ref } from 'vue'
import Mitglieder from "@/components/Mitglieder.vue";
import Artikel from "../components/Artikel.vue";
const selectedMember = ref([]);

function handleMemberSelect(member) {
  selectedMember.value = member; // Speichert das ausgewählte Mitglied
  console.log('selectedMember', selectedMember);
  console.log('selectedMember', selectedMember.value.firstName);

}

</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="8">
        <v-card class="d-flex align-center pe-2 mb-4">
          <v-icon>mdi-handshake</v-icon>
          <v-spacer></v-spacer>
          <v-card-title>Leihvorgang beginnen</v-card-title>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
          >weiter</v-btn>
         </v-card>

        <v-card class="vCardMitgliedSuchen">
          <v-chip
              class="mt-2 ml-2"
              color="primary"
              prepend-icon="mdi-close-circle-outline"
          >
            {{selectedMember.firstName}} {{selectedMember.familyName}}
          </v-chip>
          <Mitglieder @memberSelected="handleMemberSelect"/>
        </v-card>
      </v-col>
    </v-row>
  </v-container>


</template>

<style scoped>

.vCardMitgliedSuchen{
  min-height: 80vh;
  background-color: #BDBDBD;
}
.vCardTitle{
  //min-height: 8vh;
}

</style>