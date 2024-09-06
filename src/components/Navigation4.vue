<template>
  <!-- App Bar -->
  <v-app-bar color="secondary" prominent>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>IMS Willstätter Hexen</v-toolbar-title>

    <v-spacer></v-spacer>

    <template v-if="$vuetify.display.mdAndUp">
      <v-btn icon="mdi-magnify" variant="text"></v-btn>
      <v-btn icon="mdi-filter" variant="text"></v-btn>
    </template>

    <v-btn icon="mdi-dots-vertical" variant="text"></v-btn>
  </v-app-bar>

  <!-- Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'top' : undefined" temporary>
    <v-list>
      <v-list-item v-for="item in items" :key="item.title" @click="navigate(item.value)">
        <!-- Verwende den gesamten v-list-item-Content Block -->
        <v-list-item-content class="d-flex align-center">
          <v-list-item-icon class="mr-2">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'

const drawer = ref(false);

const items = [
  {title: 'Dashboard', value: '/dashboard', icon: 'mdi-view-dashboard'},
  {title: 'Artikel', value: '/artikel', icon: 'mdi-file-document'},
  {title: 'Abrechnung', value: '/abrechnung', icon: 'mdi-currency-eur'},
  {title: 'Registrierung', value: '/register', icon: 'mdi-account-plus'}
]

const router = useRouter()

function navigate(route) {
  router.push(route)
  drawer.value = false
}
</script>

<style scoped>

</style>
