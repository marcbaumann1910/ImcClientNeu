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
    }, //Hier wird festgelegt ob der Zustand bis zum schließen des Browsers oder des Tabs gespeichert (persistent) sein soll
    plugins: [
        createPersistedState({
            paths: ['cartItems','userData'], // Nur 'cartItems' persistieren
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
            //Hier werden die Externen Inventar Nummern dem jeweiligen Artikel zugeordnet
            const existingItem = state.cartItems.find((cartItems) => cartItems.IDInventarArtikel === value.idArtikel);

            if(existingItem) {
                console.log("match id in setExterneInventarNummerToCartItem")
                existingItem.externeID.push(value.externeID);
            }


        }
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
        getShowDialogExterneInventarNummer: state => state.showDialogExterneInventarNummer
    },
});

export default store;
