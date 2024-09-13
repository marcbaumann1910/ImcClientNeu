export default {
    install(app) {
        app.config.globalProperties.$isUserLoggedIn = () => {
            return !!localStorage.getItem('accessToken');
        };
    }
}
