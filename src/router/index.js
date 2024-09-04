import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Register from '../components/Register.vue';
import Testing from '../components/Testing.vue';
import Apply from '../components/AppBar.vue';
import Dashboard from "@/components/Dashboard.vue";
import Artikel from "@/components/Artikel.vue";
import Abrechnung from "@/components/Abrechnung.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/register',
        name: 'register',
        component: Register
    },
    {
        path: '/testing',
        name: 'testing',
        component: Testing
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard
    },
    {
        path: '/artikel',
        name: 'artikel',
        component: Artikel
    },
    {
        path: '/abrechnung',
        name: 'abrechnung',
        component: Abrechnung
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
