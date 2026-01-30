import Api from '@/services/Api.js';
import store from "@/store/store.js";

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
    artikels(idverein, aktiv, verleihbar) {
        console.log('artikel/:idVerein', idverein);
        return Api.get(`/artikels/`,{
            params:{
                aktiv: aktiv,
                verleihbar: verleihbar,
            }
        });
    },
    artikel(id) {
        console.log('artikel/', id);
        return Api.get(`/artikel/${id}`);
    },
    artikelUpdate(data) {
        console.log('artikelupdate/', data);
        return Api.patch(`/artikelupdate`, data);
    },
    artikelUpdateLager(data) {
        console.log('artikelUpdateLager/', data);
        return Api.patch(`/artikelupdatelager`, data);
    },
    artikelCreateNewArtikel(data) {
        console.log('artikelCreateNewArtikel/', data);
        return Api.post(`/artikelcreatenewartikel`, data);
    },
    mitglieder() {
        console.log('mitglieder: ');
        return Api.get('/mitglieder');
    },
    leihvorgangBuchen(data) {
        console.log('leihvorgang: ', data);
        return Api.patch('/leihvorgang', data);
    },
    leihvorgangInventarExterneNummern(idInventarKategorie, idVerein) {
        console.log('leihvorgang/inventarexternenummern/:idInventarKategorie: ', idInventarKategorie);
          return Api.get(`/leihvorgang/inventarexternenummern/${idInventarKategorie}`,{
            params: {
                idVerein: idVerein
            }
        });
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
    leihvorgangGetMietvertraegeByMember({ easyVereinMitgliedId, status }) {
        console.log('leihvorgangverwalten/getmietvertraegebymember:');

        return Api.get(`/leihvorgangverwalten/getmietvertraegebymember`,{
            params: {
                easyVereinMitgliedId,
                status
            }
        });
    },
    leihvorgangInventarExterneNummernVergeben(data){
    console.log('leihvorgangInventarExterneNummernUpdateVergeben:', data);
    return Api.patch('/leihvorgangverwalten/inventarexternenummernupdatevergeben', data);
    },
    leihvorgangInventarExterneNummernFreigeben(data) {
        console.log('leihvorgangInventarExterneNummernFreigeben:', data);
        return Api.patch('/leihvorgangverwalten/inventarexternenummernupdatefreigeben', data);
    },
    abrechnungsDaten(jahr) {
        console.log('abrechnungsDaten:', jahr);
        if (!jahr || jahr === '') {
            //Beim Initialaufruf gibt es kein Jahr, weshalb hier das aktuelle Jahr gesetzt wird
            jahr = new Date().getFullYear();
        }
                return Api.get(`/abrechnungsdaten/${jahr}`,{
            params: {
                idVerein: store.getters.getUserData.idVerein
            }
        });
    },
    abrechnungsDetails(data) {
        console.log('abrechnungsDaten:', data);

        return Api.get(`/abrechnungsdetails/${data.jahr}`,{
            params: {
                idMitglied: data.idMitglied
            }
        });
    },
    abrechnungNachMitglied(data) {
        //Übergabe einer MitgliederID, Backend übernimmt die komplette Abrechnung nach Jahr
        console.log('abrechnung/mitglied:', data);
        return Api.post('/abrechnung/mitglied', data);
    },
    abrechnungStorno(idAbrechnung, data) {
        //Übergabe idAbrechnung, Backend storniert die entsprechende Position
        console.log('abrechnungsdetails/storno:', idAbrechnung, data);
        return Api.patch(`/abrechnungsdetails/storno/${idAbrechnung}`, data);
    },
    abrechnungInsert() {
        //Übergabe idAbrechnung, Backend storniert die entsprechende Position
        console.log('abrechnunginsert');
        return Api.patch(`/abrechnunginsert`);
    },
    dashboardLeihvorgaenge() {
        //Abruf der Statistikdaten für das Dashboard - Leihvorgange Pie
        console.log('dashboard/leihvorgaenge');
        return Api.get(`/dashboard/leihvorgaenge`);
    },
    uploadImage(formData) {
        //Upload eines Bildes im FormData() Format
        console.log('uploadarticelimage');
        return Api.post(`/uploadarticelimage`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    confirmMietvertrag(data) {
        //Mietvertrag bestätigen
        console.log('confirmMietvertrag');
        return Api.post('/mietvertrag/confirm', data);
       },
    emailUpdateEasyverein(data) {
        //Emailadresse in easyVerein ändern oder hinterlegen
        console.log('/leihvorgang/emailupdateeasyverein');
        return Api.patch('leihvorgang/emailupdateeasyverein', data);
    }


};
