import axios from 'axios';
import router from "@/router/index.js";
import store from "@/store/store.js";
import {buildUrl} from '@/scripte/globalFunctions.js'
//import { notifyError, notifySuccess } from '@/utils/notifications'; // Benachrichtigungs-Utility

const api = axios.create({
    //baseURL: 'http://localhost:3000/', // Basis-URL des Backend-Servers
    baseURL: process.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Wichtig: Ermöglicht das Senden von Cookies mit Anfragen
});

// Interceptor für das Hinzufügen des Access Tokens bei jeder Anfrage
api.interceptors.request.use(
    (config) => {
        if(config.url !== '/login' && config.url !== '/register'){ //An diese Pfade werden Tokens gesendet!!!
            const accessToken = store.getters.getAccessToken;
            if(accessToken){
                console.log('accessToken:', accessToken);
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        console.log('Promise.reject(error)', error)
        return Promise.reject(error);
    }
)

Api.interceptors.response.use(
    response => response, // Bei Erfolg einfach zurückgeben
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            // Wenn keine ursprüngliche Anfrage vorhanden ist, lehne den Fehler ab
            return Promise.reject(error);
        }

        if (error.response) {
            const { status } = error.response;

            // Handle 401 Unauthorized
            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true; // Verhindere Endlosschleifen

                try {
                    // Erneuere den Access Token
                    console.log('Erneuere Access Token');
                    const url = await buildUrl('token/refresh'); // Deine Funktion zur URL-Erstellung
                    const response = await api.post(`${url}`);
                    console.log('Neuer Access Token:', response.data.accessToken);

                    // Speichere den neuen Access Token
                    store.commit('setAccessToken', response.data.accessToken);

                    // Aktualisiere den Authorization Header mit dem neuen Access Token
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;

                    // Sende die ursprüngliche Anfrage erneut mit dem neuen Access Token
                    return api(originalRequest);
                } catch (tokenRefreshError) {
                    console.error('Fehler beim Erneuern des Tokens:', tokenRefreshError);
                    // Lösche Tokens aus dem Speicher
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    // Leite den Benutzer zur Login-Seite weiter
                    await router.push('/login');
                    return Promise.reject(tokenRefreshError);
                }
            }

            // Handle 429 Too Many Requests
            if (status === 429) {
                notifyError('Zu viele Anfragen. Bitte versuche es später erneut.');
                return Promise.reject(error);
            }

            // Handle andere spezifische Fehler
            switch (status) {
                case 400:
                    notifyError('Ungültige Anfrage. Bitte überprüfe deine Eingaben.');
                    break;
                case 403:
                    notifyError('Zugriff verweigert. Du hast keine Berechtigung für diese Aktion.');
                    break;
                case 404:
                    notifyError('Die angeforderte Ressource wurde nicht gefunden.');
                    break;
                case 500:
                    notifyError('Serverfehler. Bitte versuche es später erneut.');
                    break;
                default:
                    notifyError('Ein unbekannter Fehler ist aufgetreten.');
            }
        } else if (error.request) {
            // Die Anfrage wurde gemacht, aber keine Antwort erhalten
            notifyError('Keine Antwort vom Server erhalten. Bitte überprüfe deine Netzwerkverbindung.');
        } else {
            // Ein Fehler beim Einrichten der Anfrage trat auf
            notifyError('Fehler beim Einrichten der Anfrage.');
        }

        return Promise.reject(error);
    }
);

console.log('API Base URL:', api.defaults.baseURL);

export default api;