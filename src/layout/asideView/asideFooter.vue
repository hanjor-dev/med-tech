<template>
	<div class="aside-footer">
		<div class="footer-btn footer-btn--logout" @click="onLogoutClick">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
				<polyline points="16 17 21 12 16 7"/>
				<line x1="21" y1="12" x2="9" y2="12"/>
			</svg>
			<span v-if="!isCollapse">退出登录</span>
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutAsideFooter">
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserInfo } from '@/stores/userInfo';
import { useRouter } from 'vue-router';

defineProps<{ isCollapse?: boolean }>();

const userInfoStore = useUserInfo();
const router = useRouter();

const onLogoutClick = () => {
	ElMessageBox.confirm('此操作将退出登录, 是否继续?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		closeOnClickModal: false,
	})
		.then(() => {
			userInfoStore.logout().then(() => {
				ElMessage.success('退出登录成功');
				router.push('/login');
			});
		})
		.catch(() => {});
};
</script>

<style lang="scss" scoped>
.aside-footer {
	padding: 10px;
	border-top: 1px solid #f0f0ee;
}

.footer-btn {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 12px;
	border-radius: 6px;
	color: #6b7280;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.18s ease;
	border: 1px solid transparent;
	user-select: none;

	svg {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	:deep(.el-menu--collapse) & {
		justify-content: center;
		padding: 8px;
		gap: 0;
	}

	&:hover {
		background: rgba(0, 0, 0, 0.04);
		color: #111827;
	}

	&--logout {
		margin-top: 2px;

		&:hover {
			background: rgba(225, 29, 72, 0.06);
			color: #e11d48;
		}
	}
}
</style>
