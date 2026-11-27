<template>
	<!-- 展开态 -->
	<div class="layout-logo-wrap" v-if="!isCollapse">
		<div class="layout-logo">
			<div class="logo-icon-wrap">
				<img src="@/assets/logo.png" alt="logo" width="60">
				<div class="logo-glow" aria-hidden="true" />
			</div>
			<div class="logo-text">
				<span class="logo-tag">CTSS · MedTech Platform</span>
				<button v-if="appVersion" type="button" class="logo-version" @click="handleVersionClick">{{ appVersion }}</button>
			</div>
		</div>
		<!-- 用户卡片 -->
		<div class="user-card">
			<div class="avatar">
				{{ userInitials }}
				<span class="online-dot" />
			</div>
			<div class="user-info" @click="handleUserClick">
				<div class="user-name">{{ userName }}</div>
				<div class="user-role">{{ roleName }}</div>
			</div>
			<div class="user-arrow">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</div>
		</div>
	</div>

	<!-- 折叠态：仅图标 -->
	<div v-else class="layout-logo-size" @click="handleUserClick">
		<div class="logo-icon-sm">
			<img src="@/assets/logo.png" alt="logo" width="40">
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutLogo">
import { computed, onMounted, ref } from 'vue';
import $axios from '@/utils/http';
import { useUserInfo } from '@/stores/userInfo';
import { useRouter } from 'vue-router';

defineProps<{ isCollapse?: boolean }>();

const router = useRouter();

const storesUserInfo = useUserInfo();
const userName = computed(() => storesUserInfo.userInfos.realName || '管理员');
const roleName = computed(() => storesUserInfo.userInfos.roleName || '');
const userInitials = computed(() => {
	const name = userName.value;
	return name.length > 0 ? name.slice(0, 1) : '管';
});

const appVersion = ref('');
onMounted(async () => {
	try {
		appVersion.value = await $axios.get<string, string>('/system/auth/version', { localErrorHandling: true });
	} catch {
		// 版本信息不可用时隐藏徽标，侧栏仍可使用。
		appVersion.value = '';
	}
});

let versionClicks = 0;
let lastVersionClick = 0;

function handleVersionClick() {
	const now = performance.now();
	versionClicks = now - lastVersionClick <= 1000 ? versionClicks + 1 : 1;
	lastVersionClick = now;
	if (versionClicks === 5) {
		versionClicks = 0;
		window.open('https://www.wolai.com/hanjor/oHMHe5jAvyTrYYWfWhHS3L', '_blank', 'noopener,noreferrer');
	}
}

const handleUserClick = () => {
	router.push('/personal');
};
</script>

<style scoped lang="scss">
/* ── Logo 展开态容器 ── */
.layout-logo-wrap {
	width: 100%;
	display: flex;
	flex-direction: column;
	padding: 0 12px 0;
	cursor: pointer;
}

/* ── Logo 区域 ── */
.layout-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 20px 4px 14px;
	border-bottom: 1px solid #f0f0ee;
	user-select: none;
	transition: opacity 0.18s ease;

	&:hover {
		.logo-tag { color: #2f5bff; }
	}
}

.logo-icon-wrap {
	position: relative;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.logo-icon-wrap img {
	display: block;
	border-radius: 6px;
	transition: opacity 0.18s ease, box-shadow 0.18s ease;
}

.logo-glow {
	position: absolute;
	inset: -6px;
	border-radius: 14px;
	background: radial-gradient(ellipse at center, rgba(47, 91, 255, 0.3) 0%, transparent 70%);
	pointer-events: none;
	z-index: -1;
}

.logo-text {
	flex: 1;
	min-width: 0;
}

.logo-tag {
	display: block;
	font-size: 9.5px;
	color: #9ca3af;
	font-weight: 500;
	letter-spacing: 0.5px;
	margin-top: 2px;
	transition: color 0.18s ease;
}

.logo-version {
	border: 0;
	font-family: inherit;
	cursor: pointer;
	user-select: none;
	display: inline-block;
	font-size: 9px;
	color: #9ca3af;
	font-weight: 500;
	margin-top: 3px;
	padding: 1px 4px;
	background: rgba(156, 163, 175, 0.1);
	border-radius: 3px;
}

/* ── 用户卡片 ── */
.user-card {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 14px;
	margin: 10px 0px;
	border-radius: 10px;
	background: #ffffff;
	border: 1px solid #e5e7eb;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
	cursor: pointer;
	transition: all 0.18s ease;
	position: relative;

	&:hover {
		border-color: rgba(47, 91, 255, 0.25);
		box-shadow: 0 0 0 3px rgba(47, 91, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);

		.user-arrow svg {
			transform: translateX(2px);
		}
	}
}

.avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: linear-gradient(135deg, #1e3a8a, #2f5bff);
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: 'Outfit', sans-serif;
	font-weight: 700;
	font-size: 14px;
	color: #fff;
	flex-shrink: 0;
	position: relative;
	box-shadow: 0 2px 8px rgba(47, 91, 255, 0.3);

	.online-dot {
		position: absolute;
		bottom: 1px;
		right: 1px;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: #10b981;
		border: 2px solid #ffffff;
	}
}

.user-info { flex: 1; min-width: 0; }

.user-name {
	font-size: 13px;
	font-weight: 600;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.user-role {
	font-size: 11px;
	color: #9ca3af;
	margin-top: 1px;
}

.user-arrow {
	color: #9ca3af;
	flex-shrink: 0;

	svg {
		width: 14px;
		height: 14px;
		transition: transform 0.18s ease;
	}
}

/* ── 折叠态 ── */
.layout-logo-size {
	width: 100%;
	height: 56px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	background-color: transparent;
	transition: background 0.18s ease;

	&:hover {
		background: rgba(0, 0, 0, 0.04);
	}
}

// .logo-icon-sm {
// 	width: 36px;
// 	height: 36px;
// 	border-radius: 10px;
// 	background: linear-gradient(135deg, #1e3a8a 0%, #2f5bff 50%, #93c5fd 100%);
// 	display: flex;
// 	align-items: center;
// 	justify-content: center;
// 	box-shadow: 0 4px 12px rgba(47, 91, 255, 0.3);

// 	svg {
// 		width: 18px;
// 		height: 18px;
// 	}
// }
</style>
