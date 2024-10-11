<script setup lang="ts">

</script>

<template>
  <v-app>

    <!-- Permanente Sidebar (rechts) -->
    <v-navigation-drawer
        app
        right
        permanent
        width="300"
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Warenkorb</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <!-- Liste der Warenkorb-Artikel -->
      <v-list>
        <v-list-item
            v-for="item in cartItems"
            :key="item.idInventarArtikel"
        >
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>Menge: {{ item.quantity }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            {{ (item.price * item.quantity).toFixed(2) }} €
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- Aktionen für den Warenkorb -->
      <v-card-actions>
        <v-btn color="primary" block @click="goToCheckout">Zur Kasse</v-btn>
        <v-btn color="secondary" block @click="clearCart">Warenkorb leeren</v-btn>
      </v-card-actions>
    </v-navigation-drawer>
  </v-app>
</template>


<style scoped>

</style>