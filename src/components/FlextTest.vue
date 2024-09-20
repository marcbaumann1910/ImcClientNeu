<script setup>

</script>

<template>
  <v-container fluid>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <h2>Dashboard Header</h2>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Sidebar -->
      <v-col cols="3"> <!-- Ändere cols="3" für feste 3 Spalten unabhängig von Bildschirmgröße -->
        <v-card class="pa-4">
          <h3>Sidebar</h3>
          <v-list dense>
            <v-list-item>Item 1</v-list-item>
            <v-list-item>Item 2</v-list-item>
            <v-list-item>Item 3</v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Main Content -->
      <v-col cols="9">
        <v-row>
          <!-- Card 1 -->
          <v-col cols="12" sm="6">
            <v-card class="pa-4">
              <h3>Card 1</h3>
              <p>Some content here...</p>
            </v-card>
          </v-col>

          <!-- Card 2 -->
          <v-col cols="12" sm="6">
            <v-card class="pa-4">
              <h3>Card 2</h3>
              <p>Some content here...</p>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <!-- Card 3 -->
          <v-col cols="12" sm="6" md="12">
            <v-card class="pa-4">
              <h3>Card 3</h3>
              <p>More content here...</p>
            </v-card>
          </v-col>

          <!-- Card 4 -->
          <v-col cols="12" sm="6" md="12">
            <v-card class="pa-4">
              <h3>Card 4</h3>
              <p>More content here...</p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
h2, h3 {
  margin: 0;
}
</style>