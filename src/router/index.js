import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home.vue';
import Register from '@/components/Register.vue';
import Testing from '@/components/Testing.vue';
import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";
import Artikel from "@/components/Artikel.vue";
import Mitglieder from "@/components/Mitglieder.vue";
import Abrechnung from "@/components/Abrechnung.vue";
import Logout from "@/components/Logout.vue";
import Profile from "@/components/Profile.vue";
import ResetPassword from "@/components/ResetPassword.vue";
import ResetPasswordRequest from "@/components/ResetPasswordRequest.vue";
import FlextTest from "@/components/FlextTest.vue";
import Leihvorgang from "@/components/Leihvorgang/Leihvorgang.vue";
import LeihvorgangVerwalten from "@/components/LeihvorgangVerwalten/LeihvorgangVerwalten.vue";
import m_LeihvorgangVerwalten from "@/components/LeihvorgangVerwalten/m_LeihvorgangVerwalten.vue";

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
        path: '/mitglieder',
        name: 'mitglieder',
        component: Mitglieder,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/leihvorgang',
        name: 'leihvorgang',
        component: Leihvorgang,
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

    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/reset-password',
        name: 'reset-password',
        component: ResetPassword,

    },
    {
        path: '/reset-password-request',
        name: 'reset-password-request',
        component: ResetPasswordRequest,

    },
    {
        path: '/flextest',
        name: 'flextest',
        component: FlextTest,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/leihvorgangverwalten',
        name: 'leihvorgangverwalten',
        component: LeihvorgangVerwalten,
        meta: { requiresAuth: true }, // Markiere diese Route als geschützt
    },
    {
        path: '/m.leihvorgangverwalten',
        name: 'm_leihvorgangverwalten',
        component: m_LeihvorgangVerwalten,
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
