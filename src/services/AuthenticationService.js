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
    },
    leihvorgangBuchen(data) {
        console.log('leihvorgang: ', data);
        return Api.patch('/leihvorgang', data);
    },
    leihvorgangVerwalten() {
        console.log('leihvorgangverwalten: ',);
        return Api.get(`/leihvorgangverwalten`);
    },
    ////Wird aktuell nicht genutzt, da die Anzeige ohne Gruppierung nach Leihvorgang gewünscht ist
    // leihvorgangBuchungen(idMitglied) {
    //     console.log('leihvorgangverwalten idMitglied: ', idMitglied);
    //     return Api.get(`/leihvorgangverwalten/${idMitglied}`);
    // },
    //Hier werden zusätzlich Parameter für die Abfragebedingungen an das Backend übergeben!
    leihvorgangArtikel(idMitglied, filters = {}) {
        console.log('leihvorgangverwalten idMitglied: ', idMitglied);
        return Api.get(`/leihvorgangverwalten/mitglied/${idMitglied}`, {
            params: filters
        });
    },
    leihvorgangArtikelRuecknahme(idInventarBuchungenPositionen) {
        console.log('leihvorgangverwalten idInventarBuchungenPositionen: ', idInventarBuchungenPositionen);
        return Api.get(`/leihvorgangverwalten/buchungspositionen/${idInventarBuchungenPositionen}`);
    },
    leihvorgangArtikelZustand() {
        console.log('leihvorgangverwalten/zustand:', );
        return Api.get(`/leihvorgangverwalten/zustand`);
    },
    leihvorgangRuecknahmeArtikel(data){
        console.log('leihvorgangverwalten/zustand:', data);
        return Api.patch('/leihvorgangverwalten/ruecknahme', data);
    },
    leihvorgangNummerAendern(data){
        console.log('leihvorgangNummerAendern/externenummeraendern:', data);
        return Api.patch('/leihvorgangverwalten/externenummeraendern', data);
    },
    leihvorgangGetArtikelTausch(idInventarKategorie) {
        console.log('leihvorgangArtikelTausch leihvorgangverwalten/artikeltausch: ', idInventarKategorie);
        return Api.get(`/leihvorgangverwalten/artikeltausch/${idInventarKategorie}`);
    },
    leihvorgangArtikelTauschen(data){
        console.log('leihvorgangNummerAendern/externenummeraendern:', data);
        return Api.patch('/leihvorgangverwalten/artikeltauschen', data);
    },

};
