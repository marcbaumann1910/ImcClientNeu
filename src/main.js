import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importiere den Router
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css'; // Optional: Für die Verwendung von Material Design Icons
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import authPlugin from "@/services/authPlugin.js";
import { useAuth } from '@/services/auth.js';

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
                },
            },
        },
    },
});

const app = createApp(App);
const { isUserLoggedIn } = useAuth();
app.config.globalProperties.$isUserLoggedIn = isUserLoggedIn;

app.use(router); // Verwende den Router
app.use(vuetify);
//app.use(authPlugin);
app.mount('#app');
