<script setup>

</script>

<template>
  <v-container>

  <h1>Abrechnung Details</h1>

    <v-card class="" max-width="400">
      <v-card-title >Name Mitglied</v-card-title>
    </v-card>

    <v-card class="my-2">

      <v-toolbar height="40" class="vToolbarOben align-center">
        <v-toolbar-title class="ma-2 text-white">Artikel-Name</v-toolbar-title>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
                variant="text"
                v-bind="props"
                class="text-white"
            ></v-btn>

          </template>
        </v-menu>
      </v-toolbar>

      <v-row>
        <!--Bild und Artikelbezeichnung-->
        <v-col cols="12" sm="6" md="4" class="text-start">
          <div class="d-flex align-end">
           <v-icon color="green">mdi-check</v-icon>
          <v-avatar class="ma-2"></v-avatar>
          <v-card-title>Hexen-Rock</v-card-title>
          </div>
        </v-col>
        <!--Artikel Details-->
        <v-col cols="12" sm="6" md="4" class="text-start">
          <v-card-title>
            <v-card-title>Artikel Details</v-card-title>
          </v-card-title>
        </v-col>
        <!--Buttons-->
        <v-col cols="12" sm="6" md="4" class="text-starts">
          <div class="d-flex flex-column align-items-center">
            <v-btn>Abrechnen</v-btn>
            <v-btn>Verkauf</v-btn>
            <v-btn>Stornieren</v-btn>
          </div>
        </v-col>
      </v-row>



    </v-card>



  </v-container>

</template>

<style scoped>

.vToolbarOben{
  background:linear-gradient(90deg,  #1A237E 15%,  #1976D2 85%);
}

.nav-icon-wrapper {
  align-items: center; /* Zentriert das Icon und das Span horizontal */
}

</style>