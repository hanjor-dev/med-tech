<template>
	<el-menu
		background-color="transparent"
		:default-active="route.path"
		:collapse="isCollapse"
		:collapse-transition="false"
		router
	>
		<template v-for="group in menuGroups" :key="group.label">
			<div class="menu-group-label" v-show="!isCollapse && !group.meta?.isHide">{{ group.label }}</div>
			<el-menu-item v-if="group.items.length === 0" :index="group.path" v-show="!group.meta?.isHide">
				<i class="iconfont" v-html="group.meta?.icon || '&#xe62e;'" />
				<template #title>
					<el-tooltip :disabled="!isCollapse" :content="group.label" placement="right" :show-after="300">
						<span>{{ group.label }}</span>
					</el-tooltip>
				</template>
			</el-menu-item>
			<template v-for="item in group.items" :key="item.path">
				<el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
					<template #title>
						<el-tooltip :disabled="!isCollapse" :content="item.meta?.title" placement="right" :show-after="300">
							<span class="menu-title-text">
								<i class="iconfont sub-icon" v-html="item.meta?.icon || '&#xe62e;'" />
								{{ item.meta?.title }}
							</span>
						</el-tooltip>
						<el-badge v-if="item.meta?.badge" :type="item.meta?.badgeType || 'warning'" :value="item.meta.badge"
							class="menu-badge" />
					</template>
					<template v-for="child in item.children" :key="child.path">
						<el-sub-menu v-if="child.children && child.children.length > 0" :index="child.path">
							<template #title>
								<span class="menu-title-text">{{ child.meta?.title }}</span>
							</template>
							<el-menu-item v-for="grandchild in child.children" :key="grandchild.path" :index="grandchild.path">
								<i class="iconfont" v-html="grandchild.meta?.icon || '&#xe62e;'" />
								<span>{{ grandchild.meta?.title }}</span>
							</el-menu-item>
						</el-sub-menu>
						<el-menu-item v-else :index="child.path">
							<span class="sub-dot" />
							<span>{{ child.meta?.title }}</span>
						</el-menu-item>
					</template>
				</el-sub-menu>
				<el-menu-item v-else :index="item.path">
					<el-tooltip :disabled="!isCollapse" :content="item.meta?.title" placement="right" :show-after="300">
						<i class="iconfont" v-html="item.meta?.icon || '&#xe62e;'"></i>
					</el-tooltip>
					<span v-if="!isCollapse">{{ item.meta?.title }}</span>
					<el-badge v-if="item.meta?.badge" :type="item.meta?.badgeType || 'warning'" :value="item.meta.badge"
						class="menu-badge" />
				</el-menu-item>
			</template>
		</template>
	</el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useRoutes } from '@/stores/routes';
import { ElBadge, ElTooltip } from 'element-plus';

defineProps<{ menuList: any[]; isCollapse?: boolean }>();

const route = useRoute();
const routesStore = useRoutes();
const { menuRoutes } = storeToRefs(routesStore);

type MenuItem = {
	path: string;
	name?: string;
	meta?: {
		title?: string;
		icon?: string;
		sort?: number;
		badge?: string | number;
		badgeType?: 'warning' | 'danger' | 'primary';
		children?: MenuItem[];
		isHide?: boolean;
	};
	children?: MenuItem[];
};

interface MenuGroup {
	label: string;
	items: MenuItem[];
	isHide?: boolean;
	path: string;
	meta: any;
}

const menuGroups = computed<MenuGroup[]>(() => {
	return (menuRoutes.value as MenuItem[]).map((group) => {
		if (group.path == "/personal") {
			group.meta!.isHide  = true
		}
		return ({
			label: group.meta?.title ?? '',
			isHide: group.meta?.isHide ?? false,
			items: (group.children ?? []) as MenuItem[],
			path: group.path ?? '',
			meta: group.meta ?? {},
		})
	});
});
</script>

<style lang="scss" scoped>
.menu-group-label {
	font-size: 10px;
	font-weight: 700;
	color: #9ca3af;
	letter-spacing: 1.2px;
	text-transform: uppercase;
	padding: 10px 10px 5px;
}

.sub-dot {
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background: #9ca3af;
	flex-shrink: 0;
	margin-right: 8px;
}

.menu-badge {
	margin-left: 6px;
}

.sub-icon {
	margin-right: 8px;
	flex-shrink: 0;
}

.menu-title-text {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	display: flex;
	align-items: center;
	gap: 6px;
}

:deep(.el-menu) {
	border-right: none;
}

:deep(.el-menu--collapse .el-sub-menu__title) {
	justify-content: center;
	padding-left: 20px !important;
}

:deep(.el-menu--collapse .el-menu-item) {
	justify-content: center;
	padding-left: 20px !important;
}

:deep(.el-popper.is-light) {
	background: #fff;
	border: 1px solid #e5e7eb;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	border-radius: 8px;

	.el-popper__arrow::before {
		background: #fff;
		border-color: #e5e7eb;
	}
}
</style>
