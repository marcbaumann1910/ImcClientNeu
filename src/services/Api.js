import axios from 'axios';

export default axios.create({
    //baseURL: 'http://localhost:3000/', // Basis-URL des Backend-Servers
    baseURL: 'https://mbdevelop.de/api/',
    headers: {
        'Content-Type': 'application/json',
    },

});
