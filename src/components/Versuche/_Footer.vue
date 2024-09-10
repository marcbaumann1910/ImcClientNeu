<template>
  <v-footer
      class="footer"
      :class="{
      scrolled: isScrolled,
      desktop: isDesktop,
    }"

      app
  >
    <v-container fluid>
      <v-row justify="center" no-gutters>
        <!-- Responsive Button-Spalten -->
        <v-col
            cols="12"
            sm="6"
            md="3"
            lg="2"
            v-for="link in links"
            :key="link"
        >
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
import {ref, onMounted, onUnmounted} from 'vue'

const links = ref(['Home', 'Über uns', 'Team', 'Services', 'Impressum']);
const isScrolled = ref(false);
const isDesktop = ref(false);

// Funktion, um die Gerätegröße zu überprüfen
const checkDevice = () => {
  isDesktop.value = window.innerWidth >= 1024;
};

// Scroll-Ereignis hinzufügen, um den Footer ein- oder auszublenden
const handleScroll = () => {
  const scrollPosition = window.scrollY;
  isScrolled.value = scrollPosition > 100;
};

// Scroll-Ereignis und Resize-Ereignis binden
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', checkDevice);
  checkDevice();  // Initiale Überprüfung bei der ersten Ladezeit
});

// Ereignisse entfernen, wenn die Komponente zerstört wird
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', checkDevice);
});
</script>

<style scoped>
/* Minimal sichtbarer Footer */
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 40px; /* Minimal sichtbare Höhe */
  background-color: #757575; /* Beispiel Farbe */
  transition: min-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  opacity: 0.7;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Vollständig sichtbarer Footer bei Scroll */
.footer.scrolled {
  min-height: 120px; /* Größere Höhe, wenn gescrollt */
  opacity: 1; /* Volle Deckkraft */
}

/* Vollständig sichtbarer Footer auf Desktop */
.footer.desktop {
  min-height: 100px; /* Auf Desktop immer volle Höhe */
  opacity: 1; /* Volle Deckkraft */
}

/* Sicherstellen, dass die Buttons auf mobilen Geräten umgebrochen werden */
v-row {
  flex-wrap: wrap;
}

/* Style für responsive Buttons */
.v-btn {
  white-space: nowrap;
}
</style>
