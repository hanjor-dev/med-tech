<template>
	<el-aside class="layout-aside" :width="isCollapse ? '64px' : '230px'">
		<Logo :is-collapse="isCollapse" />
		<el-scrollbar class="flex-auto" ref="layoutAsideScrollbarRef">
			<VerticalMenu :menuList="state.menuList" :is-collapse="isCollapse" />
		</el-scrollbar>
		<AsideFooter :is-collapse="isCollapse" />
	</el-aside>
</template>

<script setup lang="ts" name="layoutAside">
import { reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoutes } from '@/stores/routes';
import { useGlobal } from '@/stores/global';
import VerticalMenu from '../asideView/verticalMenu.vue';
import Logo from '../asideView/logo.vue';
import AsideFooter from '../asideView/asideFooter.vue';

interface AsideState {
	menuList: any[];
}

const state = reactive<AsideState>({
	menuList: [],
});

const routesStore = useRoutes();
const { menuRoutes } = storeToRefs(routesStore);
const globalStore = useGlobal();
const { asideCollapsed: isCollapse } = storeToRefs(globalStore);

watch(
	menuRoutes,
	(val) => {
		state.menuList = val;
	},
	{ immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.flex-auto {
	flex: 1;
	overflow-y: auto;
	padding: 6px 10px;
	position: relative;
	z-index: 1;
}
</style>
