<template>
  <div class="dashboard-background">
    <h1>Dashboard</h1>
    <h5>Herzlich Willkommen</h5>
    <v-container>
      <!-- Dein Inhalt hier -->
    </v-container>
  </div>
</template>

<style scoped>
.dashboard-background {
  /* Hintergrundbild */
  background-image: url('/background.jpg');

  /* Größe und Position */
  background-size: cover; /* Deckt den gesamten Container ab */
  background-position: center; /* Zentriert das Bild */
  background-repeat: no-repeat; /* Verhindert das Wiederholen des Bildes */

  /* Höhe und Breite */
  min-height: 100vh; /* Mindesthöhe auf 100% der Viewport-Höhe setzen */
  width: 100%;

  /* Optional: Textfarbe für bessere Lesbarkeit */
  color: white;

  /* Optional: Hintergrundüberlagerung für bessere Lesbarkeit des Textes */
  position: relative;
}

.dashboard-background::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Dunkle Überlagerung */
  z-index: 0;
}

.dashboard-background > * {
  position: relative;
  z-index: 1;
}
</style>




