import axios from 'axios';
import router from "@/router/index.js";
import store from "@/store/store.js";
import {buildUrl} from '@/scripte/globalFunctions.js'

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

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Wenn der Access Token abgelaufen ist (z.B. 401 Unauthorized), versuche, den Token zu erneuern
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Verhindere Endlosschleifen

             try {
                    // Hole einen neuen Access Token
                 console.log('process.env.VITE_API_URL', process.env.VITE_API_URL)
                 //Da es Probleme mit dem anfügen eines Slash (/) an die VITE_API_URL
                 //und ich das Problem nicht identifizieren kann, werde hier ggf. der Slash entfernt
                 const url = await buildUrl('token/refresh')
                 const response = await api.post(`${url}`);
                    console.log('response.data.accessToken', response.data.accessToken)
                    // Speichere den neuen Access Token
                    store.commit('setAccessToken', response.data.accessToken);

                    // Aktualisiere den Authorization Header mit dem neuen Access Token
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;

                    // Sende die ursprüngliche Anfrage erneut mit dem neuen Access Token
                    return api(originalRequest);
                } catch (error) {
                        console.error('Error refreshing token:', error);
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        await router.push('/login');
                    }

                }

        return Promise.reject(error);
    }
);

console.log('API Base URL:', api.defaults.baseURL);

export default api;