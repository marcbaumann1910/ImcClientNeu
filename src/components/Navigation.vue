<template>
  <!-- App Bar -->
  <v-app-bar color="secondary" prominent>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title class="toolbarTitle">IMS Willstätter Hexen</v-toolbar-title>

    <v-spacer></v-spacer>



    <template v-if="$vuetify.display.smAndUp">
      <v-btn icon="mdi-cart-outline" variant="text"></v-btn>
    </template>

    <div class="text-center">
      <!--Kebab-Menu-->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
        </template>

        <v-list>
          <v-list-item v-for="kebab in kebabs" :key="kebab.title" @click="navigate(kebab.value)">
            <!-- Verwende den gesamten v-list-item-Content Block -->
            <v-list-item-content class="d-flex align-center">
              <v-list-item-icon class="mr-2">
                <v-icon>{{ kebab.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-title>{{ kebab.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
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

const kebabs = [
  {title: 'Mein Profil', value: '/profile', icon: 'mdi-account'},
  {title: 'Login', value: '/login', icon: 'mdi-login'},
  {title: 'Logout', value: '/logout', icon: 'mdi-logout'},
]

const router = useRouter()

function navigate(route) {
  router.push(route)
  drawer.value = false
}
</script>

<style scoped>

.toolbarTitle{
  font-size: 20px;
}

@media screen and (max-width: 350px) {
  .toolbarTitle{
    font-size: 9px;
  }
}

@media screen and (max-width: 400px) {
  .toolbarTitle{
    font-size: 12px;
  }
}

@media screen and (max-width: 500px) {
  .toolbarTitle{
    font-size: 14px;
  }
}

</style>