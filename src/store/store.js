import {createStore} from 'vuex';
import createPersistedState from 'vuex-persistedstate';

//getters geben die Werte oder Object zurück
//mutations: Hier lassen sich Änderungen an den Werten Objekten durchführen
//actions: können von außerhalb aufgerufen werden umd Werte und Objekte zu ändern

const store = createStore({
    state: {
        isUserLoggedIn: !!localStorage.getItem('accessToken'), // initialer Zustand basierend auf localStorage
        userData: {}, // Hier werden die Benutzerdaten gespeichert
        cartItemCount: 0, //Warenkorb Anzahl Einträge
        cartItems: [], //Warenkorb-Einträge
        cartItemsAmount: 0, //Gesamtsumme aller Artikel
        borrowMember: [], //Mitglied
        showWarenkorbDesktop: true, //Anzeigensteuerung des Warenkorbs
        showDialogExterneInventarNummer: {showDialog: false, Menge: 0, idArtikel: 0}, //Zeigt den Dialog zur Erfassung der Externen Nummern an. {showDialog: boolean, Menge: int}
        showDialogRuecknahmeArtikel: {
            showDialog: false,
            IDinventarBuchungenPositionen: 0,
            bemerkung: '',
            artikelDetails: [],
            artikelZustand: '',
            memberName: '',
            idMitglied: '',
            member: []
        },
        showAusgeliehenAbgeschlossen: [],
    }, //Hier wird festgelegt ob der Zustand bis zum schließen des Browsers oder des Tabs gespeichert (persistent) sein soll
    plugins: [
        createPersistedState({
            paths: ['cartItems','userData', 'cartItemCount'], // persistieren der gewünschten Objekten
            storage: window.sessionStorage, // Verwendung von sessionStorage statt localStorage
        }),
    ],
    mutations: {
        setUserLoggedIn(state, status) {
            state.isUserLoggedIn = status;
        },
        setUserData(state, userData) {
            state.userData = userData;
        },
        logout(state) {
            state.isUserLoggedIn = false;
            state.userData = {};
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        setCartItemCount(state, cartItemCount) {
            state.cartItemCount = cartItemCount;
        },
        setCartItems(state, item) {
            //Fügt einen neuen Artikel dem Warenkorb hinzu oder ändert die Menge, wenn Artikel vorhanden ist
            const existingItem = state.cartItems.find((cartItems) => cartItems.IDInventarArtikel === item.IDInventarArtikel);

            if(existingItem) {
                // Falls der Artikel bereits im Warenkorb ist, Menge aktualisieren
                existingItem.Menge = item.Menge;


            }else{
                //sonst hinzufügen
                state.cartItems.push(item);
            }

            store.dispatch('calculateNewItemsQuantity');
            store.dispatch('calculateNewItemsAmount');

        },
        clearCartItems(state){
            //setzt nach erfolgreicher Buchung des Leihvorgangs alles auf Anfang
            sessionStorage.removeItem('cartItems');
            state.cartItems = [];
            state.cartItemCount = 0;
            state.borrowMember = [];
        },
        changeCartItemsQuantity(state, idAndChangeQuantity) {
            //Bei mehr als einem Übergabeparameter müssen die Paramter in einem Object übergeben werden!!!
            const existingItem = state.cartItems.find((cartItems) => cartItems.IDInventarArtikel === idAndChangeQuantity.id);

            if(existingItem) {
                existingItem.Menge = existingItem.Menge + idAndChangeQuantity.changeQuantity;
            }
            store.dispatch('calculateNewItemsQuantity');
            store.dispatch('calculateNewItemsAmount');
        },
        deleteItemFromCart(state, id) {
            //löschte den Artikel vollständig aus dem Warenkorb
            const index = state.cartItems.findIndex((cartItems) => cartItems.IDInventarArtikel === id);
            if(index !==-1) {
                state.cartItems.splice(index, 1);
            }
            store.dispatch('calculateNewItemsQuantity');
            store.dispatch('calculateNewItemsAmount');
        },
        setBorrowMember(state, memberValues) {
            //Speichert das Mitglied welches den/die Artikel ausleiht
            state.borrowMember = memberValues;
        },
        setShowWarenkorbDesktop(state, value){
            //Speichert die Artikel für den Warenkorb
            state.showWarenkorbDesktop = value;
        },
        calculateNewItemsAmount(state){
            //Ermittelt den Gesamtpreis aller im Warenkorb befindlichen Artikel
            state.cartItemsAmount = state.cartItems.reduce((sum, cartItem) => sum + (cartItem.Preis * cartItem.Menge), 0);
        },
        calculateNewItemsQuantity(state){
            //Hier wird die im Array vorhandene Menge aller Artikel ermittelt und setCartItemCount übergeben
            //damit die Anzeige Anzahl Warenkorb aktualisiert wird!
            state.cartItemCount = state.cartItems.reduce((sum, cartItem) => sum + cartItem.Menge, 0)
        },
        setShowDialogExterneInventarNummer(state, value){
            //Sollte ein Wert nicht übergeben werden können (wie z.B. idArtikel) wird diese nicht gelöscht,
            //sondern die anderen Werte aktualisiert
            state.showDialogExterneInventarNummer = {
                ...state.showDialogExterneInventarNummer,
                ...value,
            };
        },
        setExterneInventarNummerToCartItem(state, value){
            //Siehe Doku!!!
            //Folgende Parameter werden aktuell als Objekt übergeben:
            //correctionInventarNummerCount --> dient zur Korrektur der Werte in cartItems.externeID und entspricht der Anzahl der Textfelder die max. zur Verfügung stehen
            //idAritkel
            //externeID

            //Hier werden die Externen Inventar Nummern dem jeweiligen Artikel zugeordnet
            const existingItem = state.cartItems.find((cartItems) => cartItems.IDInventarArtikel === value.idArtikel);

            //Wenn die Menge der Artikel im Checkout kleiner ist, als die erfassten ExternenInventarNummern
            //wird hier die Korrektur der externeID durchgeführt, das bestehende Array externeID in cartItems
            //geleert und nur die Einträge der ersten Einträge (correctionInventarNummerCount = entspricht den Textfeldern)
            //zur Erfassung der ExternenInventarNummern.
            //Beispiel: Menge Artikel = 2, erfasste ExternenInventarNummern = 3 (weil die Menge nach dem Erfassen im Checkout) reduziert wird.
            //Die Anzeige der ExternenInventarNummern stimmt dann nicht mit der Menge im Checkout überein. Deshalb müssen die Einträge in
            //cartItems.externeID korrigiert werden. Im Prinzip werden die letzte(n) Einträge entfernt!
            if (existingItem && value.correctionInventarNummerCount !== undefined && value.correctionInventarNummerCount !== '') {
                const correctionCartItems = [];
                //Array existingItem.externeID kopieren und existingItem.externeID im Anschluss löschen
                correctionCartItems.push(...existingItem.externeID);
                existingItem.externeID = [];
                for(let i = 0; i < value.correctionInventarNummerCount; i++){
                    existingItem.externeID.push(correctionCartItems[i]);
                }
                return;
            }

            if(existingItem) {
                console.log("match id in before push setExterneInventarNummerToCartItem")
                //Wichtig! ...value.externeID.value (sonst ist es ein verschachteltes Array!!!!)
                existingItem.externeID = [];
                existingItem.externeID.push(...value.externeID.value);
                console.log("after push id in setExterneInventarNummerToCartItem")
            }


            },
        setShowDialogRuecknahmeArtikel(state, value){
            //Wird ein Artikel zurückgegeben, wird dieser hier gespeichert
            //damit dieser im Hauptformular LeihvorgangVerwalten verarbeitet werden kann

            state.showDialogRuecknahmeArtikel.showDialog = value.showDialog

            if(value.IDinventarBuchungenPositionen !== '' && value.IDinventarBuchungenPositionen > 0){
                state.showDialogRuecknahmeArtikel.IDinventarBuchungenPositionen = value.IDinventarBuchungenPositionen;
            }
            if(value.bemerkung.length > 0 && value.bemerkung !== ''){
               state.showDialogRuecknahmeArtikel.bemerkung = value.bemerkung;
            }
            if (value.artikelDetails && Object.keys(value.artikelDetails).length > 0) {
                state.showDialogRuecknahmeArtikel.artikelDetails = value.artikelDetails;
            }
            if(value.artikelZustand !== ''){
                state.showDialogRuecknahmeArtikel.artikelZustand = value.artikelZustand;
            }
            if(value.memberName.length > 0 && value.memberName !== ''){
                state.showDialogRuecknahmeArtikel.memberName = value.memberName;
            }
            if(value.idMitglied !== '') {
                state.showDialogRuecknahmeArtikel.idMitglied = value.idMitglied
            }


            },
        setShowAusgeliehenAbgeschlossen(state, value) {
            const existingItem = state.showAusgeliehenAbgeschlossen.find(
                (item) => item.idMitglied === value.idMitglied
            );

            if (existingItem) {
                // Aktualisiere nur die übergebenen Eigenschaften
                if (value.checkedStateAusgeliehen !== undefined) {
                    existingItem.checkedStateAusgeliehen = value.checkedStateAusgeliehen;
                }
                if (value.checkedStateAbgeschlossen !== undefined) {
                    existingItem.checkedStateAbgeschlossen = value.checkedStateAbgeschlossen;
                }
            } else {
                // Füge ein neues Element mit Standardwerten hinzu
                const newItem = {
                    idMitglied: value.idMitglied,
                    checkedStateAusgeliehen: value.checkedStateAusgeliehen !== undefined ? value.checkedStateAusgeliehen : true, // Standardwert
                    checkedStateAbgeschlossen: value.checkedStateAbgeschlossen !== undefined ? value.checkedStateAbgeschlossen : false, // Standardwert
                };
                state.showAusgeliehenAbgeschlossen.push(newItem);
            }

            console.log('vuex state.showAusgeliehenAbgeschlossen', state.showAusgeliehenAbgeschlossen);
        },

    },
    actions: {
        login({ commit }, userData) {
            commit('setUserLoggedIn', true);
            commit('setUserData', userData);
        },
        logout({ commit }) {
            commit('logout');
        },
        setCartItemCount({ commit }, count) {
            commit('setCartItemCount', count);
        },
        setCartItems({ commit }, items) {
            commit('setCartItems', items);
        },
        changeCartItemsQuantity({ commit }, idAndChangeQuantity) {
            commit('changeCartItemsQuantity', idAndChangeQuantity);
        },
        setBorrowMember({ commit }, values) {
            commit('setBorrowMember', values);
        },
        setShowWarenkorbDesktop({ commit }, value) {
            commit('setShowWarenkorbDesktop', value);
        },
        deleteItemFromCart({ commit }, item){
            commit('deleteItemFromCart', item);
        },
        calculateNewItemsAmount({ commit }){
            commit('calculateNewItemsAmount')
        },
        calculateNewItemsQuantity({ commit }){
            commit('calculateNewItemsQuantity')
        },
        setShowDialogExterneInventarNummer({ commit }, value){
            commit('setShowDialogExterneInventarNummer', value)
        },
        setExterneInventarNummerToCartItem({ commit }, value){
            commit('setExterneInventarNummerToCartItem', value)
        },
        clearCartItems({ commit }){
            commit('clearCartItems');
        },
        setShowDialogRuecknahmeArtikel({ commit }, value){
            commit('setShowDialogRuecknahmeArtikel', value)
        },
        setShowAusgeliehenAbgeschlossen( { commit }, value){
            commit('setShowAusgeliehenAbgeschlossen', value)
        }

    },
    getters: {
        isUserLoggedIn: state => state.isUserLoggedIn,
        getUserData: state => state.userData,
        getCartItemCount: state => state.cartItemCount,
        getCartItems: state => state.cartItems,
        getBorrowMember: state => state.borrowMember,
        getShowWarenkorbDesktop: state => state.showWarenkorbDesktop,
        getCartItemsAmount: state => state.cartItemsAmount,
        getShowDialogExterneInventarNummer: state => state.showDialogExterneInventarNummer,
        getExterneNummernForArtikel: (state) => (idArtikel) => {
            const existingItem = state.cartItems.find(
                (cartItem) => cartItem.IDInventarArtikel === idArtikel
            );
            return existingItem ? existingItem.externeID || [] : [];
        },
        getExterneNummernCount: (state) => (idArtikel) => {
            //SIEHE DOKU!!!
            //Dient der Anzeige im Checkout wie viele ExterneIventarNummern erfasst wurden
            //Filtert cartItems nach der übergebenen IDInventarArtikel
            const existingItems = state.cartItems.filter((cartItem) =>
                cartItem.IDInventarArtikel === idArtikel);

            //Wenn die IDInventarArtikel nicht gefunden wird, geben wir 0 zurück
            if(existingItems.length === 0){
                return 0;
            }

            // Wir nehmen das erste gefundene Item, da IDInventarArtikel eindeutig sein sollte
            const existingItem = existingItems[0];

            // Bereinigen des externeID-Arrays, um leere Werte zu entfernen
            const cleanedExterneID = existingItem.externeID.filter(
                (externeID) => externeID !== '' && externeID !== null && externeID !== undefined
            );
            console.log('cleanedExterneID.length',cleanedExterneID.length )
            return cleanedExterneID.length;
        },
        getShowDialogRuecknahmeArtikel: (state) => state.showDialogRuecknahmeArtikel,
        getShowAusgeliehenAbgeschlossen: (state) => (idMitglied) => {
            return state.showAusgeliehenAbgeschlossen.find(
                (item) => item.idMitglied === idMitglied
            );
        },

    },

});

export default store;
