import Api from '@/services/Api.js';
const accessToken = localStorage.getItem('accessToken');

export default {

    register(credentials) {
        console.log('credentials:', credentials);
        return Api.post('/register', credentials);
    },
    login(credentials) {
        console.log('login:', credentials);
        return Api.post('/login', credentials);
    },
    testing(id) {
        console.log('id: ', id);
        return Api.post('/testing', id);
    }
};
