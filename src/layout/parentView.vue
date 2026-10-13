<template>
	<div class="layout-parent">
		<router-view v-slot="{ Component }">
			<!-- <keep-alive :include="keepAliveNames"> -->
				<component :is="Component" />
			<!-- </keep-alive> -->
		</router-view>
	</div>
</template>

<script setup lang="ts" name="layoutParentView">
import { storeToRefs } from 'pinia';
import { useKeepALiveNames } from '@/stores/keepAliveNames';

const keepAliveNamesStore = useKeepALiveNames();
const { keepAliveNames } = storeToRefs(keepAliveNamesStore);
</script>
