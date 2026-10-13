<template>
	<div class="layout-navbars-breadcrumb">
		<el-breadcrumb class="layout-navbars-breadcrumb-hide">
			<transition-group name="breadcrumb">
				<el-breadcrumb-item v-for="(v, k) in state.breadcrumbList"
					:key="v.meta?.title">
					<span v-if="k === state.breadcrumbList.length - 1" class="layout-navbars-breadcrumb-span">
						<div>{{ v.meta?.title }}</div>
					</span>
					<a v-else @click.prevent="onBreadcrumbClick(v)">{{ v.meta?.title }}</a>
				</el-breadcrumb-item>
			</transition-group>
		</el-breadcrumb>
	</div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useRoutes } from '@/stores/routes';

declare type BreadcrumbState = {
	breadcrumbList: any[];
};

// 定义变量内容
const storesRoutes = useRoutes();
const { wholeRoutes } = storeToRefs(storesRoutes);
const route = useRoute();
const router = useRouter();

const state = reactive<BreadcrumbState>({
	breadcrumbList: [],
});

// 扁平化路由树，提取所有叶子路由的路径与 title 映射
const flatMenuList = computed(() => {
	const list: any[] = [];
	const walk = (routes: any[]) => {
		routes.forEach((v: any) => {
			if (v.meta?.title) {
				list.push(v);
			}
			if (v.children) walk(v.children);
		});
	};
	// wholeRoutes[0] 是根布局路由，其 children 是一级菜单
	const root = wholeRoutes.value[0];
	if (root?.children) walk(root.children);
	return list;
});

// 面包屑点击时
const onBreadcrumbClick = (v: any) => {
	const { redirect, path } = v;
	if (redirect) router.push(redirect);
	else router.push(path);
};


// 处理面包屑数据（根据路由路径匹配面包屑）
const getBreadcrumbList = (routePath: string) => {
	const paths = routePath.split('/').filter(Boolean);
	const result: any[] = [];
	let current = flatMenuList.value;

	for (let i = 0; i < paths.length; i++) {
		const segment = `/${paths.slice(0, i + 1).join('/')}`;
		const found = current.find((v: any) => v.path === segment);
		if (found) {
			result.push(found);
			if (found.children) {
				current = found.children;
			}
		}
	}

	state.breadcrumbList = result;
};

// 页面加载时
onMounted(() => {
	getBreadcrumbList(route.path);
});

// 路由更新时
onBeforeRouteUpdate((to) => {
	getBreadcrumbList(to.path);
});
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb {
	flex: 1;
	height: inherit;
	display: flex;
	align-items: center;

	.layout-navbars-breadcrumb-icon {
		cursor: pointer;
		font-size: 18px;
		color: var(--next-bg-topBarColor);
		height: 100%;
		width: 40px;
		opacity: 0.8;

		&:hover {
			opacity: 1;
		}
	}

	.layout-navbars-breadcrumb-span {
		display: flex;
		opacity: 0.7;
		color: var(--next-bg-topBarColor);
	}

	.layout-navbars-breadcrumb-iconfont {
		font-size: 14px;
		margin-right: 5px;
	}

	:deep(.el-breadcrumb__separator) {
		opacity: 0.7;
		color: var(--next-bg-topBarColor);
	}

	:deep(.el-breadcrumb__inner a, .el-breadcrumb__inner.is-link) {
		font-weight: unset !important;
		color: var(--next-bg-topBarColor);

		&:hover {
			color: var(--el-color-primary) !important;
		}
	}
}
</style>
