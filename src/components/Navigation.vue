<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from "vuetify";
import AuthenticationService from "@/services/AuthenticationService.js";
import store from "@/store/store.js";

const drawer = ref(false);
const { smAndDown } = useDisplay();
const current = ref(''); // set from this.$route
const isLoggedIn = computed(() => !!store.getters.getAccessToken);

const isAdmin = computed(()=> store.getters.getUserData.isAdmin);

console.log('isAdmin', isAdmin.value)


console.log(store.getters.getShowWarenkorbDesktop);

store.dispatch('setCartItemCount', 0)




function currentSelection(){
  console.log('current', current)
}

const items = [
  { title: 'Dashboard', route: '/dashboard', icon: 'mdi-view-dashboard', requiresAdmin: false },
  {
    title: 'Leihvorgang',
    icon: 'mdi-handshake',
    requiresAdmin: false,
    active: false, // Wichtig für v-model
    children: [
      { title: 'Buchen', route: '/leihvorgang', icon: 'mdi-book' },
      { title: 'Verwalten', route: '/leihvorgangverwalten', icon: 'mdi-cog' },
    ],
  },
  { title: 'Artikel', route: '/artikel', icon: 'mdi-file-document', requiresAdmin: true },
  { title: 'Mitglieder', route: '/mitglieder', icon: 'mdi-account-multiple', requiresAdmin: true },
  { title: 'Abrechnung', route: '/abrechnung', icon: 'mdi-currency-eur',requiresAdmin: false },
  { title: 'Registrierung', route: '/register', icon: 'mdi-account-plus', requiresAdmin: false },
  { title: 'Testing', route: '/testing', icon: 'mdi-ab-testing', requiresAdmin: true },
  { title: 'Mobil', route: '/m.checkout', icon: 'mdi-cellphone', requiresAdmin: true },
];


const kebabs = [
  {title: 'Mein Profil', route: '/profile', icon: 'mdi-account'},
  //{title: 'Login', route: '/login', icon: 'mdi-login'},
  {title: 'Abmelden', route: '/logout', icon: 'mdi-logout'},
]

const router = useRouter()
//Prüft ob der User eingeloggt ist oder nicht
const isUserLoggedIn = computed(() => !!store.getters.getAccessToken);

//Ist für die Navigation zuständig und ruft die entsprechende route auf, die durch das Click-Event ausgelöst wird
async function navigate(route) {
  //LOGOUT
  if(route === '/logout') {
    //Vuex-Store logout und userResponse leeren

    try {
      //refreshToken in der Datenbank als ungültig markieren
      console.log('localStorage', localStorage)
      const accessToken = store.getters.getAccessToken
      const response = await AuthenticationService.logout({
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

//Steuert über den vuex-Store die Anzeige des Warenkorbs in <Leihvorgang/>
//da dieser über mehrere Komponenten gesteuert wird
function showCartChange(){
  if(smAndDown.value){
    store.dispatch("setShowWarenkorbMobile", !store.getters.getShowWarenkorbMobile);
    return;
  }
  store.dispatch("setShowWarenkorbDesktop", !store.getters.getShowWarenkorbDesktop);
  console.log(store.getters.getShowWarenkorbDesktop)
}


</script>

<template>

  <!-- App Bar -->
  <v-app-bar class="mb-6" color="secondary" prominent>

    <div class="nav-icon-wrapper d-flex flex-column align-items-center">
      <v-app-bar-nav-icon v-if="isLoggedIn" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <span v-if="isLoggedIn" class="span">Menü</span>
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

    <v-btn v-if="isUserLoggedIn"
           class="text-none" stacked
           @click="showCartChange"
    >
      <v-badge
          v-if="store.getters.getCartItemCount > 0"
          color="success"
          :content="store.getters.getCartItemCount"
      >
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

  <!-- Navigation Drawer Einträge Menü-->
  <!--  image="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"-->
  <v-navigation-drawer
      v-model="drawer"
      :location="$vuetify.display.mobile ? 'top' : undefined"
      temporary
  >
    <v-list nav dense density="compact" class="pa-0 ma-0">
      <template v-for="(item, index) in items" :key="index">
        <!-- Gruppe für Items mit Unterelementen -->
        <v-list-group
            v-if="item.children"
            v-model="item.active"
            :prepend-icon="item.icon"
        >
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title class="text-black">{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- Unterelemente -->
          <v-list-item
              v-for="(child, i) in item.children"
              :key="`child-${index}-${i}`"
              @click="navigate(child.route)"
          >
              <v-list-item-title class="text-black">{{ child.title }}</v-list-item-title>
          </v-list-item>
        </v-list-group>

        <!-- Einzelne Items ohne Unterelemente -->
        <v-list-item
            v-else
            v-show="!item.requiresAdmin || isAdmin"
            :key="`item-${index}`"
            @click="navigate(item.route)"
            :prepend-icon="item.icon"
        >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>

</template>


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