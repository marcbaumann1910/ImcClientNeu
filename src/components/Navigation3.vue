<template>
  <div>
    <v-app-bar
        app
        color="secondary"
        dark
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"> </v-app-bar-nav-icon>
      <v-toolbar-title>
        ProjectName
      </v-toolbar-title>

      <!-- Senkrechte Punkte auf der rechten Seite -->
      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Burger Menu Navigation Drawer -->
    <v-navigation-drawer
        v-model="drawer"
        app
        temporary
    >
      <v-list dense>
        <v-list-item v-for="(item, index) in menuItems" :key="index" router :to="item.link">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>

        <v-subheader>Services</v-subheader>
        <v-list-item v-for="(item, index) in services" :key="index" router :to="item.link">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

<!--    <v-main>-->
<!--      <router-view></router-view>-->
<!--    </v-main>-->
  </div>
</template>

<script>
export default {
  data: () => ({
    drawer: false,
    menuItems: [
      { title: "Home", icon: "mdi-home", link: "/" },
      { title: "About Us", icon: "mdi-information", link: "/about" },
      { title: "Contact Us", icon: "mdi-email", link: "/contact" },
    ],
    services: [
      { icon: "mdi-domain", title: "Media Monitoring", link: "/mmrservices" },
      { icon: "mdi-message-text", title: "Audience Measurement", link: "/amrservices" },
      { icon: "mdi-flag", title: "Integration Analysis" },
    ]
  })
};
</script>

<style scoped>
</style>
