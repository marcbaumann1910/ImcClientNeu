import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dotenv from 'dotenv';

export default defineConfig(({ mode }) => {

  console.log('Vite Build Mode:', mode);

  // Lade die entsprechende .env-Datei basierend auf dem Modus (development/production)
  dotenv.config({
    path: mode === 'production' ? '.env.production' : '.env',
  });

  return {
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/__tests__/*.spec.js'],
    },
    server: {
      port: 4000,
      sourcemap: false, // Deaktiviert Source Maps auf dem Entwicklungsserver
    },
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'vue': 'vue/dist/vue.esm-bundler.js',  // Falls Vue explizit benötigt wird
      },
    },
    define: {
      // Leitet die Umgebungsvariable in den Client-Code weiter
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    },
  };
});