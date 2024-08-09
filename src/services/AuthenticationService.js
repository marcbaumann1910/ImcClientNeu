import Api from '@/services/Api.js';

export default {
    register(credentials) {
        console.log('credentials:', credentials);
        return Api.post('/register', credentials);
    },
    testing(id) {
        console.log('id: ', id);
        return Api.post('/testing', id);
    }
};
