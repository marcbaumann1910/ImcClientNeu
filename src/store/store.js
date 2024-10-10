import { createStore } from 'vuex';

const store = createStore({
    state: {
        isUserLoggedIn: !!localStorage.getItem('accessToken'), // initialer Zustand basierend auf localStorage
        userData: {}, // Hier werden die Benutzerdaten gespeichert
        cartItemCount: 0, //Warenkorb Anzahl Einträge
        cartItems: [], //Warenkorb-Einträge
        borrowMember: [], //Mitglied

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
            state.cartItemCount = state.cartItemCount + cartItemCount;
        },
        setCartItems(state, item) {
            const existingItem = state.cartItems.find((cartItems) => cartItems.idInventarArtikel === item.idInventarArtikel);

            if(existingItem) {
                // Falls der Artikel bereits im Warenkorb ist, Menge aktualisieren
                const newMenge = existingItem.menge += item.menge;
                existingItem.menge = newMenge;

            }else{
                //sonst hinzufügen
                state.cartItems.push(item);
            }
        },
        setBorrowMember(state, memberValues) {
            state.borrowMember = memberValues;
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
        }
        ,
        setBorrowMember({ commit }, values) {
            commit('setBorrowMember', values);
        }
    },
    getters: {
        isUserLoggedIn: state => state.isUserLoggedIn,
        getUserData: state => state.userData,
        getCartItemCount: state => state.cartItemCount,
        getCartItems: state => state.cartItems,
        getBorrowMember: state => state.borrowMember,
    },
});

export default store;
