import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dotenv from 'dotenv';

export default defineConfig(({ mode }) => {
  // Lade die entsprechende .env-Datei basierend auf dem Modus (development/production)
  dotenv.config({
    path: mode === 'production' ? '.env.production' : '.env',
  });

  return {
    server: {
      port: 4000,
      sourcemap: false, // Deaktiviert Source Maps auf dem Entwicklungsserver
    },
    build: {
      sourcemap: false, // Deaktiviert Source Maps im Build-Prozess
    },
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      // Leitet die Umgebungsvariable in den Client-Code weiter
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    },
  };
});
