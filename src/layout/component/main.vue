<template>
	<el-main class="layout-main">
		<el-scrollbar
			ref="layoutMainScrollbarRef"
			class="layout-main-scroll layout-backtop-header-fixed"
			wrap-class="layout-main-scroll"
			view-class="layout-main-scroll"
		>
			<LayoutParentView />
		</el-scrollbar>
	</el-main>
</template>

<script setup lang="ts" name="layoutMain">
import { defineAsyncComponent, onMounted, ref } from 'vue';
// import { NextLoading } from '@/utils/loading';

// 引入组件
const LayoutParentView = defineAsyncComponent(() => import('@/layout/parentView.vue'));

// 定义变量内容
const layoutMainScrollbarRef = ref();

// 页面加载前
onMounted(() => {
	// NextLoading.done(600);
});

// 暴露变量
defineExpose({
	layoutMainScrollbarRef,
});
</script>
