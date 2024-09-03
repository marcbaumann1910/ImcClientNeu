import axios from 'axios';

const api = axios.create({
    //baseURL: 'http://localhost:3000/', // Basis-URL des Backend-Servers
    baseURL: 'https://mbdevelop.de/api/',
    headers: {
        'Content-Type': 'application/json',
    },

});

console.log('API Base URL:', api.defaults.baseURL);

export default api;