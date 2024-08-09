import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Register from '../components/Register.vue';
import Testing from '../components/Testing.vue';

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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
