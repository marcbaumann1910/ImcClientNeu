<template>
  <v-footer
      class="footer bg-indigo-lighten-1 text-center d-flex flex-column"

  >
    <div>
      <v-btn
          v-for="icon in icons"
          :key="icon"
          :icon="icon"
          class="mx-4"
          variant="text"
      ></v-btn>
    </div>

    <div class="pt-0">
      <strong>mbdevelop.de - Marc Baumann</strong>
    </div>

    <v-divider></v-divider>

    <div>
      {{ new Date().getFullYear() }}
    </div>
  </v-footer>
</template>

<script setup>

const icons = [
      'mdi-facebook',
      'mdi-twitter',
      'mdi-linkedin',
      'mdi-linkedin',
      'mdi-instagram',
    ]



</script>

<style scoped>

.footer{
  height: 100px;
}

</style>