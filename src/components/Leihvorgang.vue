<script setup>
import { ref } from 'vue'
import Mitglieder from "@/components/Mitglieder.vue";
import store from "@/store/store.js"
import Artikel from "../components/Artikel.vue";
const selectedMember = ref([]);

function handleMemberSelect(member) {
  selectedMember.value = member; // Speichert das ausgewählte Mitglied
  store.dispatch('setBorrowMember', selectedMember);
  console.log('selectedMember', selectedMember);
  console.log('selectedMember', selectedMember.value.firstName);
  console.log('store', store.getters.getBorrowMember.firstName);
}

function deleteSelectedMember(){
  selectedMember.value = null;
  store.dispatch('setBorrowMember', []);
  console.log('store', store.getters.getBorrowMember.firstName);
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

          <v-card
              v-if="selectedMember && selectedMember.firstName"
              class="d-flex flex-column justify-center"
              flat
              color="success"
          >

            <v-card-title
                class="text-center"
            >
              <v-card-subtitle>ausgewählt:</v-card-subtitle>
             {{selectedMember.firstName}} {{selectedMember.familyName}}

            </v-card-title>
          <v-row no-gutters class="justify-start">
            <v-col>
            <v-icon
                class="ml-2 mb-2"
                @click="deleteSelectedMember()"
            >
              mdi-close-circle
            </v-icon>
            </v-col>
          </v-row>
          </v-card>
          <v-chip
              v-if="selectedMember && selectedMember.firstName && $vuetify.display.mobile"
              class="mt-2 ml-2"
              color="primary"
              prepend-icon="mdi-close-circle-outline"
              @click="deleteSelectedMember"
          >
            {{selectedMember.firstName}} {{selectedMember.familyName}}
          </v-chip>
          <!--hier wird die Auswahl aus Mitglieder empfangen und an handleMemberSelect übergeben -->
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