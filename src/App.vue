<script setup lang="ts">
import { watch } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import { useUserInfo } from '@/stores/userInfo';
import notificationPopup from '@/components/notificationPopup.vue';
import announcementPopup from '@/components/announcementPopup.vue';
import { useAnnouncementStore } from '@/stores/announcement';

const notificationStore = useNotificationStore();
const announcementStore = useAnnouncementStore();
const userStore = useUserInfo();

watch(
	() => userStore.userInfos?.id,
	(id) => {
		if (id) {
			notificationStore.init();
			announcementStore.init();
		} else {
			notificationStore.disconnect();
			announcementStore.disconnect();
		}
	},
	{ immediate: true }
);
</script>

<template>
	<router-view />
	<notificationPopup />
	<announcementPopup />
</template>
