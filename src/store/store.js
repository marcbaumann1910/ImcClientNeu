import {createStore} from 'vuex';

const store = createStore({
    state: {
        isUserLoggedIn: !!localStorage.getItem('accessToken'), // initialer Zustand basierend auf localStorage
        userData: {}, // Hier werden die Benutzerdaten gespeichert
        cartItemCount: 0, //Warenkorb Anzahl Einträge
        cartItems: [], //Warenkorb-Einträge
        borrowMember: [], //Mitglied
        showWarenkorbDesktop: true, //Anzeigensteuerung des Warenkorbs

    },
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

            //Hier wird die im Array vorhandene Menge aller Artikel ermittelt und setCartItemCount übergeben
            //damit die Anzeige Anzahl Warenkorb aktualisiert wird!
            const sumMenge = state.cartItems.reduce((sum, cartItem) => sum + cartItem.Menge, 0)
            store.dispatch('setCartItemCount', sumMenge);

        },
        changeCartItemsQuantity(state, idAndChangeQuantity) {
            //Bei mehr als einem Übergabeparameter müssen die Paramter in einem Object übergeben werden!!!
            const existingItem = state.cartItems.find((cartItems) => cartItems.IDInventarArtikel === idAndChangeQuantity.id);

            if(existingItem) {
                ////Für eventuelles Löschen der Artikel wenn Menge unter 1
                // if(newQuantity < 1) {
                //     this.deleteItemFromCart(existingItem.IDInventarArtikel);
                // }
                existingItem.Menge = existingItem.Menge + idAndChangeQuantity.changeQuantity;
            }

        },
        deleteItemFromCart(state, id) {
            //löschte den Artikel vollständig aus dem Warenkorb
            const index = state.cartItems.findIndex((cartItems) => cartItems.IDInventarArtikel === id);
            if(index !==-1) {
                state.cartItems.splice(index, 1);
            }
        },
        setBorrowMember(state, memberValues) {
            //Speichert das Mitglied welches den/die Artikel ausleiht
            state.borrowMember = memberValues;
        },
        setShowWarenkorbDesktop(state, value){
            //Speichert die Artikel für den Warenkorb
            state.showWarenkorbDesktop = value;
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
        }
        ,
        setBorrowMember({ commit }, values) {
            commit('setBorrowMember', values);
        },
        setShowWarenkorbDesktop({ commit }, value) {
            commit('setShowWarenkorbDesktop', value);
        },
        deleteItemFromCart({ commit }, item){
            commit('deleteItemFromCart', item);
        }
    },
    getters: {
        isUserLoggedIn: state => state.isUserLoggedIn,
        getUserData: state => state.userData,
        getCartItemCount: state => state.cartItemCount,
        getCartItems: state => state.cartItems,
        getBorrowMember: state => state.borrowMember,
        getShowWarenkorbDesktop: state => state.showWarenkorbDesktop,
    },
});

export default store;
