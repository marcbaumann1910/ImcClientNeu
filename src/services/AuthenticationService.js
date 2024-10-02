import Api from '@/services/Api.js';

export default {

    register(credentials) {
        console.log('credentials:', credentials);
        return Api.post('/register', credentials);
    },
    login(credentials) {
        console.log('login:', credentials);
        return Api.post('/login', credentials);
    },
    logout(token) {
        console.log('logout:', token);
        return Api.post('/logout', token);
    },
    testing(id) {
        console.log('id: ', id);
        return Api.post('/testing', id);
    },
    resetPassword(credentials) {
        console.log('reset-password: ', credentials);
        return Api.post('/reset-password', credentials);
    },
    resetPasswordRequest(email) {
        console.log('reset-password-request: ', email);
        return Api.post('/reset-password-request', email);
    },
    artikel() {
        console.log('artikel: ');
        return Api.get('/artikel');
    },
    mitglieder() {
        console.log('mitglieder: ');
        return Api.get('/mitglieder');
    }

};
