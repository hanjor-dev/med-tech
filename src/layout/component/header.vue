<template>
	<el-header class="layout-header">
		<div class="layout-navbars-container">
			<div class="layout-navbars-breadcrumb-index">
				<button class="collapse-btn" @click="toggleAside" :title="isCollapse ? '展开菜单' : '收起菜单'">
					<el-icon :size="22">
						<Expand v-if="isCollapse" />
						<Fold v-else />
					</el-icon>
				</button>
				<Breadcrumb />
				<NotificationBell />
				<AnnouncementBell />
				<User />
			</div>
		</div>

	</el-header>
</template>

<script setup lang="ts" name="layoutHeader">
import { storeToRefs } from 'pinia';
import { useGlobal } from '@/stores/global';
import Breadcrumb from '../headerView/breadcrumb.vue';
import User from '../headerView/user.vue';
import NotificationBell from '@/components/notificationBell.vue';
import AnnouncementBell from '@/components/announcementBell.vue';
import { Expand, Fold } from '@element-plus/icons-vue';

const globalStore = useGlobal();
const { asideCollapsed: isCollapse } = storeToRefs(globalStore);
const { toggleAside } = globalStore;
</script>

<style scoped lang="scss">
.layout-navbars-container {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.layout-navbars-breadcrumb-index {
	height: 50px;
	display: flex;
	align-items: center;
	background: var(--next-bg-topBar);
	border-bottom: 1px solid var(--next-border-color-light);
}

.collapse-btn {
	width: 32px;
	height: 32px;
	border: none;
	background: transparent;
	color: #6b7280;
	cursor: pointer;

	&:hover {
		background: rgba(0, 0, 0, 0.06);
		color: #374151;
	}
}

.layout-navbars-breadcrumb-index :deep(.notification-bell) {
	margin-right: 20px;
}

.layout-navbars-breadcrumb-index :deep(.announcement-entry) {
	margin-right: 14px;
}
</style>
