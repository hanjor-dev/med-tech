<template>
	<div class="layout-navbars-breadcrumb-user">
		<div class="avatar">
			{{ userInitials }}
			<span class="online-dot"></span>
		</div>
		<div class="user-info">
			<div class="user-name">{{ userName }}</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUser">
import { useUserInfo } from '@/stores/userInfo'
import { computed } from 'vue';

// 定义变量内容
const storesUserInfo = useUserInfo();
const userName = computed(() => storesUserInfo.userInfos.realName || '管理员');
const roleName = computed(() => storesUserInfo.userInfos.roleName || '');
const userInitials = computed(() => {
	const name = userName.value;
	return name.length > 0 ? name.slice(0, 1) : '管';
});
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user {
	display: flex;
	align-items: center;
	justify-content: flex-end;

	&-link {
		height: 100%;
		display: flex;
		align-items: center;
		white-space: nowrap;

		&-photo {
			width: 25px;
			height: 25px;
			border-radius: 100%;
		}
	}

	&-icon {
		padding: 0 10px;
		cursor: pointer;
		color: var(--next-bg-topBarColor);
		height: 50px;
		line-height: 50px;
		display: flex;
		align-items: center;

		&:hover {
			background: var(--next-color-user-hover);

			i {
				display: inline-block;
				animation: logoAnimation 0.3s ease-in-out;
			}
		}
	}

	:deep(.el-dropdown) {
		color: var(--next-bg-topBarColor);
	}

	:deep(.el-badge) {
		height: 40px;
		line-height: 40px;
		display: flex;
		align-items: center;
	}

	:deep(.el-badge__content.is-fixed) {
		top: 12px;
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

	.user-info {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		font-size: 13px;
		font-weight: 600;
		color: #111827;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-left: 10px;
	}

	.user-role {
		font-size: 11px;
		color: #9ca3af;
		margin-top: 1px;
	}
}
</style>
