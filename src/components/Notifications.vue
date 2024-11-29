<script setup >
import store from "@/store/store.js"
import { computed } from "vue";

const notifications = computed(() =>
    store.getters.getNotifications.map(notification => ({
      ...notification,
      visible: true
    }))
);

const removeNotification = (id) => {
  store.dispatch('removeNotification', id);
};

const onClose = (id) => {
  removeNotification(id);
};

</script>

<template>
  <div>
    <v-snackbar
        v-for="notification in notifications"
        :key="notification.id"
        v-model="notification.visible"
        :color="notification.color"
        :timeout="notification.timeout"
        location="top"
        right
        @input="onClose(notification.id)"
    >
      {{ notification.message }}
      <v-btn size="small" color="white" @click="onClose(notification.id)">Schließen</v-btn>
    </v-snackbar>
  </div>
</template>

<style scoped>

</style>