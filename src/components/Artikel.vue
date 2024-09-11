
<template>
  <div>
    <v-card class="pa-10">
      <div class="text-subtitle-2 mb-8" ><strong> Automarken </strong> </div>
    <v-expansion-panels v-model="panel" multiple>
      <v-expansion-panel class="mb-1" v-for="marke in katgorie" :key="marke">
        <template v-slot:title>
          <v-row>
            <v-col>
              <strong>
                <v-icon>mdi-car-back</v-icon>
                {{ marke }}
              </strong>
            </v-col>
          </v-row>
        </template>

        <v-expansion-panel-text>
          <v-list>
            <!-- Verwende v-list-item, um die Abstände besser zu steuern -->
            <v-list-item
                v-for="(model, index) in vwModels"
                :key="index"
                class="custom-list-item"
                :rounded="rounded"
                elevation="1"
                @click="test()"
            >
              <v-list-item-title>
                <img
                    src="https://picsum.photos/40"
                    alt="Auto"
                    style="width: 40px; height: 40px; margin-right: 8px"
                />
                {{ model }}
              </v-list-item-title>
              <v-list-item-subtitle
              >Weitere Informationen über das Modell</v-list-item-subtitle
              >
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    </v-card>
  </div>

</template>

<script setup>
import { ref } from 'vue'

const vwModels = ref(['Golf', 'Passat', 'Tiguan'])
const bmwModels = ref(['X5', '3er', '5er'])
const katgorie = ref(['VW', 'BMW'])
const rounded = ref(true)
const panel = ref(null)

function test() {
  rounded.value = !rounded.value
}
</script>

<style scoped>
.custom-list-item {
  margin-bottom: 5px; /* Reduziert den Abstand zwischen den Listenelementen */
  padding: 8px; /* Fügt Padding innerhalb der Listenelemente hinzu */
  border: 1px solid #e0e0e0; /* Fügt einen Rahmen um die Listenelemente hinzu */
  border-radius: 8px; /* Runde Ecken */
}
.custom-list-item:hover {
  background-color: #ebebeb;
  cursor: pointer;
}
</style>
