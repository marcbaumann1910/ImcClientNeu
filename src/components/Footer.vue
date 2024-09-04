<template>
  <v-footer
      class="footer"
      :class="{ scrolled: isScrolled }"
      app
  >
    <v-container fluid>
      <v-row justify="center" no-gutters>
        <!-- Responsive Button-Spalten -->
        <v-col cols="12" sm="6" md="3" lg="2" v-for="link in links" :key="link">
          <v-btn
              class="mx-2"
              color="white"
              rounded="xl"
              variant="text"
              block
          >
            {{ link }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Text mit Jahr und Name -->
      <v-row justify="center">
        <v-col class="text-center mt-4" cols="12">
          {{ new Date().getFullYear() }} — <strong>Marc Baumann</strong>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const links = ref(['Home', 'Über uns', 'Team', 'Services', 'Impressum']);
const isScrolled = ref(false);

// Scroll-Ereignis hinzufügen, um den Footer ein- oder auszublenden
const handleScroll = () => {
  const scrollPosition = window.scrollY;
  isScrolled.value = scrollPosition > 100;
};

// Scroll-Ereignis binden, wenn die Komponente gemountet ist
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

// Scroll-Ereignis entfernen, wenn die Komponente zerstört wird
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Minimal sichtbarer Footer */
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px; /* Minimal sichtbare Höhe */
  background-color: #424242; /* Beispiel Farbe */
  transition: height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  overflow: hidden;
  opacity: 0.7;
}

/* Vollständig sichtbarer Footer */
.footer.scrolled {
  height: 120px; /* Voll sichtbare Höhe */
  opacity: 1; /* Volle Deckkraft */
}

/* Style für responsive Buttons */
.v-btn {
  white-space: nowrap;
}
</style>
