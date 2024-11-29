import store from "@/store/store.js"

export function notifyError(message) {
    store.dispatch('setNotification', {
        id: Date.now(),
        message: message,
        color: 'error',
        timeout: 5000,
        visible: true,
    });
}

export function notifySuccess(message) {
    store.dispatch('setNotification',{
        id: Date.now(),
        message: message,
        color: 'success',
        timeout: 3000,
        visible: true,
    });
}
