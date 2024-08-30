import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importiere den Router
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css'; // Optional: Für die Verwendung von Material Design Icons
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
    components,
    directives,
    // Hier kannst du deine Vuetify-Konfiguration hinzufügen
    theme: {
        defaultTheme: 'myCustomTheme',
        themes: {
            myCustomTheme: {
                colors: {
                    primary: '#1976D2',
                    secondary: '#424242',
                    accent: '#82B1FF',
                    error: '#FF5252',
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FB8C00',
                },
            },
        },
    },
});

const app = createApp(App);

app.use(router); // Verwende den Router
app.use(vuetify);
app.mount('#app');
