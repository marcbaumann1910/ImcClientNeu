// main.js

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importiere den Router
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css'; // Optional: Für die Verwendung von Material Design Icons
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import store from './store/store';
import api from './services/Api.js'; // Importiere die 'api' Instanz

const vuetify = createVuetify({
    components,
    directives,
    // Hier kannst du deine Vuetify-Konfiguration hinzufügen
    theme: {
        defaultTheme: 'ims',
        themes: {
            ims: {
                dark: false,
                colors: {
                    primary: '#1976D2',
                    secondary: '#424242',
                    accent: '#82B1FF',
                    error: '#FF5252',
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FB8C00',
                    background: '#F5F5F5',
                    background2: '#E0E0E0',
                    grey: '#757575',
                    hover: '#BDBDBD',
                },
            },
        },
    },
});
const app = createApp(App);
app.use(router);
app.use(vuetify);
app.use(store);

// Wartet, bis der Router bereit ist, bevor die App gemountet wird
router.isReady().then(async () => {
    try {
        // Jetzt ist der Router bereit, du kannst auf die aktuelle Route zugreifen
        const currentRoute = router.currentRoute.value;
        const requiresAuth = currentRoute.matched.some(record => record.meta.requiresAuth);

        if (requiresAuth) {
            // Versuche, den Access Token zu erneuern
            await api.refreshAccessToken();
            console.log('Access Token erfolgreich erneuert.');
        }
    } catch (error) {
        console.error('Fehler beim Erneuern des Access Tokens:', error);
        // Leite nur weiter, wenn die Route geschützt ist
        const currentRoute = router.currentRoute.value;
        const requiresAuth = currentRoute.matched.some(record => record.meta.requiresAuth);

        if (requiresAuth) {
            await router.push('/login');
        }
    } finally {
        // Jetzt kannst du die App mounten
        app.mount('#app');
    }
});

