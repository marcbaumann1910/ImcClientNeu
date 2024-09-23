<template>
  <!-- App Bar -->
  <v-app-bar class="mb-6" color="secondary" prominent>

    <div class="nav-icon-wrapper d-flex flex-column align-items-center">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <span class="span">Menü</span>
    </div>
      <v-toolbar-title class="toolbarTitle">IMS Willstätter Hexen</v-toolbar-title>
      <v-spacer></v-spacer>

    <!--Login-->
    <v-btn v-if="!isUserLoggedIn" @click="goLogin()">
      <div class="login">
        Login
      </div>
      <v-icon icon="mdi-login" class="mr-1"></v-icon>
    </v-btn>

    <!--Warenkorb-->

    <v-btn v-if="isUserLoggedIn" class="text-none" stacked>
      <v-badge v-if="store.getters.getCartItemCount > 0" color="success" :content="store.getters.getCartItemCount">
      <v-icon>mdi-cart-outline</v-icon>
      </v-badge>
      <v-icon v-else >mdi-cart-outline</v-icon>
    </v-btn>
<!--Warenkorb nur auf kleinen AndUp anzeigen-->
<!--    <template v-if="$vuetify.display.smAndUp">-->
<!--      <v-btn icon="mdi-cart-outline" variant="text"></v-btn>-->
<!--    </template>-->

    <div class="text-center">
      <!--Kebab-Menu-->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
        </template>

        <v-list>
          <v-list-item v-for="kebab in kebabs" :key="kebab.title" @click="navigate(kebab.route)">
            <v-list-item-title>
                <v-icon left class="mr-2" >{{ kebab.icon }}</v-icon>
              {{ kebab.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>

  <!-- Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'top' : undefined" temporary>
    <v-list>
      <v-list-item v-for="item in items" :key="item.title" @click="navigate(item.route)">
          <v-list-item-title>
            <v-icon class="mr-2">{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthenticationService from "@/services/AuthenticationService.js";
import store from "@/store/store.js";

const drawer = ref(false);

let cartItems = [{
  artikelID: 1,
  artikelBezeichnung: "Rock",
  artikelGroesse: "L"
}]
console.log('cartItems', cartItems);

store.dispatch('setCartItems', cartItems);
console.log('store cartItems', store.getters.getCartItems)

cartItems.push({
  artikelID: 2,
  artikelBezeichnung: "Bluse",
  artikelGroesse: "M"
})
store.dispatch('setCartItems', cartItems);
console.log('store cartItems', store.getters.getCartItems)


store.dispatch('setCartItemCount', 0)
console.log(store.getters.getCartItemCount)

const items = [
  {title: 'Dashboard', route: '/dashboard', icon: 'mdi-view-dashboard'},
  {title: 'Artikel', route: '/artikel', icon: 'mdi-file-document'},
  {title: 'Abrechnung', route: '/abrechnung', icon: 'mdi-currency-eur'},
  {title: 'Registrierung', route: '/register', icon: 'mdi-account-plus'},
  {title: 'Testing', route: '/testing', icon: 'mdi-ab-testing'}
]

const kebabs = [
  {title: 'Mein Profil', route: '/profile', icon: 'mdi-account'},
  //{title: 'Login', route: '/login', icon: 'mdi-login'},
  {title: 'Abmelden', route: '/logout', icon: 'mdi-logout'},
]

const router = useRouter()
//Prüft ob der User eingeloggt ist oder nicht
const isUserLoggedIn = computed(() => store.getters.isUserLoggedIn);

//Ist für die Navigation zuständig und ruft die entsprechende route auf, die durch das Click-Event ausgelöst wird
async function navigate(route) {
  //LOGOUT
  if(route === '/logout') {
    //Vuex-Store logout und userResponse leeren

    try {
      //refreshToken in der Datenbank als ungültig markieren
      console.log('localStorage', localStorage)
      const refreshToken = localStorage.getItem('refreshToken')
      const accessToken = localStorage.getItem('accessToken')
      const response = await AuthenticationService.logout({
        refreshToken: refreshToken,
        accessToken: accessToken
      });
      console.log('VuexStore bevor dispatch',store.getters.getUserData.idBenutzer);
      store.dispatch('logout')
      console.log('VuexStore nach dispatch',store.getters.getUserData.idBenutzer);
      console.log('Logout-->response', response)

    }catch(err) {
      console.log(err)
    }
    localStorage.clear();
    router.push({name: 'login'})
  }
  else{
    router.push(route)
  }
  router.push(route)
  drawer.value = false
}

function goLogin() {
  router.push({name: 'login'})
}

</script>

<style scoped>

.nav-icon-wrapper {
  align-items: center; /* Zentriert das Icon und das Span horizontal */
}

.span{
  margin-top: -10px;
  font-size: 9px;
}


.toolbarTitle{
  font-size: 20px;
}

.login{
  text-transform: none;
  margin-right: 2px;
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