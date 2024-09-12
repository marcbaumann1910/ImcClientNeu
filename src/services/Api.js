import axios from 'axios';
import router from "@/router/index.js";

const api = axios.create({
    //baseURL: 'http://localhost:3000/', // Basis-URL des Backend-Servers
    baseURL: process.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },

});

// Interceptor für das Hinzufügen des Access Tokens bei jeder Anfrage
api.interceptors.request.use(
    (config) => {
        if(config.url !== '/login' && config.url !== '/register'){
            const accessToken = localStorage.getItem('accessToken');
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

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Hole einen neuen Access Token
                    const response = await axios.post(`${process.env.VITE_API_URL}/token/refresh`, {}, {
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`
                        }
                    });

                    // Speichere den neuen Access Token
                    localStorage.setItem('accessToken', response.data.accessToken);

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
            }

        return Promise.reject(error);
    }
);

console.log('API Base URL:', api.defaults.baseURL);

export default api;