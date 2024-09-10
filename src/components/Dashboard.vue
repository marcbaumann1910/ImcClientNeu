

<template>
  <v-app>
    <v-container>
      <v-stepper
          :next-text="nextName"
          :items="['Step 1', 'Step 2', 'Step 3']"
          v-model="currentStep"
      >
        <template v-slot:item.1>
          <v-card title="Step One" flat>
            <v-text-field label="Label" v-model="textField"> </v-text-field>
            <v-row>
              <v-col cols="12" sm="6">
                <v-btn
                    style="
                    background-color: green;
                    position: absolute;
                    top: 5px;
                    right: 5px;
                  "
                    v-model="btnTest"
                    @click="btnAction"
                >
                  TEST
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </template>

        <template v-slot:item.2>
          <v-card title="Step Two" flat>...</v-card>
        </template>

        <template v-slot:item.3>
          <v-card title="Step Three" flat> </v-card>
        </template>
      </v-stepper>
    </v-container>
  </v-app>
</template>
<script setup>
import { ref } from 'vue'
const btnTest = ref('')
const nextName = ref('')
const currentStep = ref('')
const textField = ref('')
function btnAction() {
  nextName.value = 'huhu'
  textField.value = currentStep.value
}
</script>
undefined

