import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home.vue';
import Register from '@/components/Register.vue';
import Testing from '@/components/Testing.vue';
import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";
import Artikel from "@/components/Artikel.vue";
import Abrechnung from "@/components/Abrechnung.vue";
import Logout from "@/components/Logout.vue";
import Profile from "@/components/Profile.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/register',
        name: 'register',
        component: Register
    },
    {
        path: '/testing',
        name: 'testing',
        component: Testing,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/artikel',
        name: 'artikel',
        component: Artikel,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/abrechnung',
        name: 'abrechnung',
        component: Abrechnung,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/logout',
        name: 'logout',
        component: Logout,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Füge eine Navigation Guard hinzu
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const accessToken = localStorage.getItem('accessToken');

    if (requiresAuth && !accessToken) {
        // Falls die Route eine Authentifizierung erfordert, aber kein Access Token vorhanden ist
        next({ name: 'login' });
    } else {
        // Weiter zur gewünschten Route
        next();
    }
});


export default router;
