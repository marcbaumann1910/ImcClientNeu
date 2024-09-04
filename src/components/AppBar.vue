<template>
  <v-app-bar app color="secondary" dark>
    <!-- Burger Button: Links platziert -->
    <v-btn icon @click="drawer = !drawer">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <!-- App Title -->
    <v-toolbar-title>Inventory Management System</v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Optional: Weitere Icons oder Buttons können hier auf der rechten Seite hinzugefügt werden -->

    <!-- Navigation Drawer für das Menü: Links positioniert -->
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
            v-for="(item, index) in menuItems"
            :key="index"
            @click="navigate(item.route)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Vue Router hook to programmatically navigate
const router = useRouter()
const navigate = (route) => {
  router.push(route)
}

// Reactive drawer state
const drawer = ref(false)

// Menu items for navigation
const menuItems = [
  { title: 'Dashboard', route: '/dashboard' },
  { title: 'Artikel', route: '/artikel' },
  { title: 'Abrechnung', route: '/abrechnung' },
]
</script>

<style scoped>
/* Optional: Du kannst hier zusätzliche Stile hinzufügen, wenn gewünscht */
</style>
