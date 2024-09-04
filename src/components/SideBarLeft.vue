<template>
  <v-navigation-drawer app permanent>
    <v-list dense>
      <v-list-item-group>
        <!-- Dashboard Link -->
        <v-list-item
            @click="goTo('dashboard')"
            link
        >
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

        <!-- Artikel-Kategorie Link -->
        <v-list-item
            @click="goTo('artikel')"
            link
        >
          <v-list-item-icon>
            <v-icon>mdi-clipboard-list</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Artikel-Kategorie</v-list-item-title>
        </v-list-item>

        <!-- Abrechnung Link -->
        <v-list-item
            @click="goTo('abrechnung')"
            link
        >
          <v-list-item-icon>
            <v-icon>mdi-cash-register</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Abrechnung</v-list-item-title>
        </v-list-item>

        <!-- Register Link -->
        <v-list-item
            @click="goTo('register')"
            link
        >
          <v-list-item-icon>
            <v-icon>mdi-account-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Registriere</v-list-item-title>
        </v-list-item>


      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(route) {
  router.push({ name: route })
}
</script>

<style scoped>
/* Optional: Custom styles for sidebar */
</style>
