import axios from 'axios';
import router from "@/router/index.js";
import store from "@/store/store.js";
import {buildUrl} from '@/scripte/globalFunctions.js';
import { notifyError } from '@/scripte/notifications.js'; // Globale Benachrichtigungen

const api = axios.create({
    baseURL: process.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Wichtig: Ermöglicht das Senden von Cookies mit Anfragen
});

// Variable, um den Status der Token-Erneuerung zu verfolgen
api.isRefreshing = false;
api.refreshSubscribers = [];

// Funktion, um Abonnenten zu benachrichtigen, wenn der Access Token erneuert wurde
function onAccessTokenFetched(accessToken) {
    api.refreshSubscribers.forEach((callback) => callback(accessToken));
    api.refreshSubscribers = [];
}

// Funktion, um Anfragen zu sammeln, die auf den neuen Access Token warten
function addRefreshSubscriber(callback) {
    api.refreshSubscribers.push(callback);
}

// Interceptor für das Hinzufügen des Access Tokens bei jeder Anfrage
api.interceptors.request.use(
    async (config) => {
        console.log('Angeforderte URL:', config.url);

        // Entfernt die Query-Parameter aus der URL
        const url = config.url.split('?')[0];
        // Da bei reset-password noch ein token angefügt ist, wird hier sichergestellt
        // das die Route extrahiert wird um eine Anfrage an das Backend zusenden
        const isExcluded = [
            '/login',
            '/register',
            '/token/refresh',
            '/reset-password-request',
            '/reset-password',
            '/mietvertrag/confirm'
        ].some(excludedUrl => url === excludedUrl);

        if (!isExcluded) {
            const accessToken = store.getters.getAccessToken;

            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            } else {
                if (!api.isRefreshing) {
                    api.isRefreshing = true;
                    try {
                        const newAccessToken = await api.refreshAccessToken();
                        onAccessTokenFetched(newAccessToken);
                    } catch (error) {
                        return Promise.reject(error);
                    } finally {
                        api.isRefreshing = false;
                    }
                }

                return new Promise((resolve) => {
                    // addRefreshSubscriber((accessToken) => {
                    //     config.headers['Authorization'] = `Bearer ${accessToken}`;
                    //     resolve(config);
                    // });
                    //NEU: 09.01.2026
                    addRefreshSubscriber((accessToken) => {
                        if (accessToken) {
                            config.headers['Authorization'] = `Bearer ${accessToken}`;
                        } else {
                            delete config.headers['Authorization'];
                        }
                        resolve(config);
                    });

                });
            }
        }
        return config;
    },
    (error) => {
        console.log('Promise.reject(error)', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
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
                    const newAccessToken = await api.refreshAccessToken();
                    console.log('Neuer Access Token:', newAccessToken);

                    // Aktualisiere den Authorization Header mit dem neuen Access Token
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // Sende die ursprüngliche Anfrage erneut mit dem neuen Access Token
                    return api(originalRequest);
                } catch (tokenRefreshError) {
                    console.error('Fehler beim Erneuern des Tokens:', tokenRefreshError);
                    // Lösche Tokens aus dem Speicher
                    store.commit('setAccessToken', null);
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

// Funktion zum Erneuern des Access Tokens als Methode des 'api' Objekts
api.refreshAccessToken = async function() {
    await store.dispatch('setIsAuthLoading', true);
    try {
        console.log('Starte Token-Erneuerung...');
        const url = await buildUrl('token/refresh');

        // Verwende eine separate Axios-Instanz ohne Interceptors
        const refreshApi = axios.create({
            baseURL: process.env.VITE_API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        const response = await refreshApi.post(`${url}`);
        const newAccessToken = response.data.accessToken;
        console.log('Neuer Access Token erhalten:', newAccessToken);

        // Speichere den neuen Access Token im Store
        store.commit('setAccessToken', newAccessToken);

        return newAccessToken;
    } catch (error) {
        console.error('Fehler beim Erneuern des Tokens:', error);

        // Überprüfe, ob der Fehler auf fehlenden oder ungültigen Refresh Token zurückzuführen ist
        if (error.response && [401, 403].includes(error.response.status)) {
            // Kein gültiger Refresh Token vorhanden, Benutzer ist nicht eingeloggt
            // Das ist in Ordnung, wir können den Fehler ignorieren
            console.log('Kein gültiger Refresh Token vorhanden. Benutzer ist nicht eingeloggt.');
        } else {
            // Handle andere Fehler
            console.error('Ein unerwarteter Fehler ist aufgetreten:', error);
        }
    } finally {
        await store.dispatch('setIsAuthLoading', false);
    }
}

console.log('API Base URL:', api.defaults.baseURL);

export default api;
