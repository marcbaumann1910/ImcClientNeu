import { ref } from 'vue';

// Initialer Zustand für die Authentifizierung
const isUserLoggedIn = ref(!!localStorage.getItem('accessToken'));

export function useAuth() {
    return {
        isUserLoggedIn
    };
}
