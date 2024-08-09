import axios from 'axios';

export default axios.create({
    baseURL: 'http://localhost:3000/', // Basis-URL des Backend-Servers
    headers: {
        'Content-Type': 'application/json',
    },
});
