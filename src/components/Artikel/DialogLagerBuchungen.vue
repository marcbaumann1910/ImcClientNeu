<script setup lang="ts">

</script>

<template>
  <v-dialog v-model="bookingDialog" max-width="520">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center">
        Lagerbuchung
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="closeBookingDialog" />
      </v-card-title>

      <v-card-text>
        <v-form ref="bookingFormRef" validate-on="submit">
          <v-row dense>
            <v-col cols="12">
              <v-select
                  v-model="booking.type"
                  :items="bookingTypes"
                  label="Typ"
                  variant="solo-filled"
                  :rules="[req('Typ ist Pflicht')]"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                  v-model.number="booking.amount"
                  label="Menge"
                  variant="solo-filled"
                  inputmode="numeric"
                  type="number"
                  min="1"
                  :rules="[req('Menge ist Pflicht'), positiveInt]"
              />
            </v-col>

            <!-- Optional: Sofort-Feedback bei Abgang -->
            <v-col cols="12" v-if="booking.type === 'Abgang'">
              <v-alert variant="tonal" type="warning" density="compact">
                Neuer Bestand wäre: <b>{{ projectedStock }}</b>
              </v-alert>
            </v-col>

            <v-col cols="12" v-if="bookingError">
              <v-alert variant="tonal" type="error" density="compact">
                {{ bookingError }}
              </v-alert>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn variant="text" class="text-none" @click="closeBookingDialog">
          Abbrechen
        </v-btn>
        <v-spacer />
        <v-btn
            color="primary"
            class="text-none"
            :loading="bookingSaving"
            :disabled="bookingSaving"
            @click="submitBooking"
        >
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


</template>

<style scoped>

</style>