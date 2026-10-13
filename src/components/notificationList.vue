<template>
	<div class="nl-root">
		<div class="nl-tabs">
			<button v-for="tab in tabs" :key="tab.value" :class="['nl-tab', { active: activeTab === tab.value }]"
				@click="activeTab = tab.value; handleTabChange()">
				<span class="nl-tab__label">{{ tab.label }}</span>
			</button>
		</div>

		<el-scrollbar v-loading="loading" class="nl-scroll" height="calc(100vh - 200px)">
			<div v-if="messages.length === 0 && !loading" class="nl-empty">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
					<path d="M13.73 21a2 2 0 0 1-3.46 0" />
				</svg>
				<span class="nl-empty__text">暂无通知消息</span>
				<span class="nl-empty__sub">系统运行正常，当有新消息时会在此显示</span>
			</div>

			<div v-for="(msg, idx) in messages" :key="msg.id"
				:class="['nl-item', { unread: msg.isRead === 0, active: selectedId === msg.id }]"
				:style="{ animationDelay: `${idx * 40}ms` }" @click="handleClick(msg)">
				<div class="nl-item__indicator" :class="getCategoryClass(msg.category)" />

				<div class="nl-item__body">
					<div class="nl-item__header">
						<span class="nl-item__title"><span v-if="msg.isRead === 0" class="nl-item__unread-tag">未读</span>{{ msg.title }}</span>
						<span class="nl-item__time">{{ formatTime(msg.createTime) }}</span>
					</div>

					<div class="nl-item__meta">
						<span :class="['nl-badge', getCategoryClass(msg.category)]">
							{{ getCategoryLabel(msg.category) }}
						</span>
						
					</div>

					<Transition name="nl-expand">
						<div v-if="msg.content && selectedId === msg.id" class="nl-item__content">
							<template v-if="parseContent(msg.content)">
								<div v-for="f in parseContent(msg.content)!.fields" :key="f.key" class="nl-field">
									<span class="nl-field__label">{{ f.label }}</span>
									<span class="nl-field__value">{{ f.value }}</span>
								</div>
								<div v-if="parseContent(msg.content)!.remark" class="nl-field__remark">
									{{ parseContent(msg.content)!.remark }}
								</div>
							</template>
							<template v-else class="nl-field__raw">
								{{ msg.content }}
							</template>
							<div v-if="msg.jumpUrl && msg.bizId" class="nl-item__actions">
								<el-link type="primary" @click.stop="handleView(msg)">
									查看详情
								</el-link>
							</div>
						</div>
					</Transition>
				</div>
			</div>
		</el-scrollbar>

		<el-pagination v-if="total > 0" v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
			layout="total, prev, pager, next" size="small" class="nl-pagination" @current-change="loadMessages" />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { getNotificationList, markMessageRead } from '@/api/notification';
import { useNotificationStore } from '@/stores/notification';
import type { NotificationMessage, MessageCategory } from '@/types/notification';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

const emit = defineEmits<{
	(e: 'close'): void
}>()

const activeTab = ref('');
const tabs = [
	{ label: '全部', value: '' },
	{ label: '订单', value: 'ORDER' },
	{ label: '审核', value: 'APPROVAL' },
	{ label: '设计', value: 'DESIGN' },
	{ label: '生产', value: 'PRODUCTION' },
	{ label: '系统通知', value: 'SYSTEM' }
];
const messages = ref<NotificationMessage[]>([]);
const pageNum = ref(1);
const pageSize = ref(20);
const total = ref(0);
const loading = ref(false);
const selectedId = ref<number | null>(null);

async function loadMessages() {
	loading.value = true;
	try {
		const res = await getNotificationList({
			category: activeTab.value ? (activeTab.value as MessageCategory) : undefined,
			pageNum: pageNum.value,
			pageSize: pageSize.value
		}) as any;
		messages.value = res.records || [];
		total.value = res.total || 0;
	} catch (err) {
		console.error('加载消息失败', err);
	} finally {
		loading.value = false;
	}
}

function handleTabChange() {
	pageNum.value = 1;
	selectedId.value = null;
	loadMessages();
}

async function handleClick(msg: NotificationMessage) {
	selectedId.value = selectedId.value === msg.id ? null : msg.id;
	if (msg.isRead === 0) {
		try {
			await markMessageRead(msg.id);
			msg.isRead = 1;
			notificationStore.refreshUnreadCount();
		} catch (err) {
			console.error('标记已读失败', err);
		}
	}
}

function handleView(msg: NotificationMessage) {
	if (msg.jumpUrl && msg.bizId) {
		const isCancelApply = msg.jumpUrl === '/order/cancel-apply/audit'
		const isModifyApply = msg.jumpUrl === '/modifyApply'
		const targetPath = isCancelApply || isModifyApply ? '/order' : msg.jumpUrl
		const query: Record<string, string> = { detailId: String(msg.bizId) }
		if (isCancelApply) {
			query.jumpUrl = msg.jumpUrl
		}
		if (isModifyApply) {
			query.tab = 'modifyApply'
		}
		try { router.push({ path: targetPath, query }) } catch { }
		emit('close')
	}
}

function parseContent(content: string) {
	try {
		const parsed = JSON.parse(content)
		return parsed?.fields?.length ? parsed : null
	} catch { return null }
}

function formatTime(time: string) {
	return dayjs(time).format("YYYY-MM-DD HH:mm");
}

const categoryLabels: Record<string, string> = {
	ORDER: '订单',
	APPROVAL: '审核',
	PRODUCTION: '生产',
	DESIGN: '设计',
	QC: '质检',
	WAREHOUSE: '仓储',
};

function getCategoryLabel(category?: string) {
	return categoryLabels[category || ''] || '系统';
}

function getCategoryClass(category?: string) {
	return `nl-cat--${(category || 'default').toLowerCase()}`;
}

onMounted(loadMessages);
</script>

<style scoped>
.nl-root {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: #f8fafc;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.nl-tabs {
	display: flex;
	gap: 4px;
	padding: 12px 16px;
	background: #ffffff;
	/* border-bottom: 1px solid #e2e8f0; */
	flex-shrink: 0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)
}

.nl-tab {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	border-radius: 6px;
	font-size: 13px;
	font-weight: 500;
	color: #64748b;
	background: transparent;
	border: none;
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
}

.nl-tab:hover {
	background: #f1f5f9;
	color: #334155;
}

.nl-tab.active {
	background: #1e293b;
	color: #ffffff;
	font-weight: 600;
}

.nl-tab__count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	border-radius: 9px;
	font-size: 10px;
	font-weight: 700;
	font-family: 'SF Mono', 'Consolas', monospace;
	background: #e2e8f0;
	color: #475569;
}

.nl-tab.active .nl-tab__count {
	background: rgba(255, 255, 255, 0.2);
	color: #ffffff;
}

.nl-scroll {
	flex: 1;
	background: #f8fafc;
}

.nl-item {
	display: flex;
	gap: 12px;
	padding: 14px 16px;
	margin: 6px 12px;
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.2s ease;
	background: #ffffff;
	border: 1px solid transparent;
	position: relative;
	animation: nl-slide-in 0.3s ease both;
}

.nl-item:hover {
	background: #ffffff;
	border-color: #cbd5e1;
	transform: translateX(2px);
}

.nl-item.unread {
	background: #eff6ff;
	border-color: #bfdbfe;
}

.nl-item.unread:hover {
	background: #dbeafe;
	border-color: #93c5fd;
}

.nl-item.active {
	background: #ffffff;
	border-color: #3b82f6;
	box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

@keyframes nl-slide-in {
	from {
		opacity: 0;
		transform: translateY(8px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.nl-item__indicator {
	width: 3px;
	border-radius: 2px;
	flex-shrink: 0;
	background: #cbd5e1;
}

.nl-cat--order {
	background: #3b82f6;
}

.nl-cat--approval {
	background: #f59e0b;
}

.nl-cat--production {
	background: #10b981;
}

.nl-cat--design {
	background: #8b5cf6;
}

.nl-cat--qc {
	background: #ef4444;
}

.nl-cat--warehouse {
	background: #06b6d4;
}

.nl-cat--default {
	background: #64748b;
}

.nl-item__body {
	flex: 1;
	min-width: 0;
}

.nl-item__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	margin-bottom: 6px;
}

.nl-item__title {
	font-size: 14px;
	font-weight: 600;
	color: #0f172a;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	display: flex;
	gap: 5px;
}

.nl-item__time {
	font-size: 11px;
	font-weight: 500;
	color: #94a3b8;
	font-family: 'SF Mono', 'Consolas', monospace;
	flex-shrink: 0;
}

.nl-item__meta {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 4px;
}

.nl-badge {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 4px;
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.5px;
	text-transform: uppercase;
}

.nl-cat--order.nl-badge {
	background: #dbeafe;
	color: #1d4ed8;
}

.nl-cat--approval.nl-badge {
	background: #fef3c7;
	color: #b45309;
}

.nl-cat--production.nl-badge {
	background: #d1fae5;
	color: #047857;
}

.nl-cat--design.nl-badge {
	background: #ede9fe;
	color: #6d28d9;
}

.nl-cat--qc.nl-badge {
	background: #fee2e2;
	color: #b91c1c;
}

.nl-cat--warehouse.nl-badge {
	background: #cffafe;
	color: #0e7490;
}

.nl-cat--default.nl-badge {
	background: #f1f5f9;
	color: #475569;
}

.nl-item__unread-tag {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 2px 6px;
	border-radius: 4px;
	font-size: 10px;
	font-weight: 700;
	color: #3b82f6;
	background: #dbeafe;
}

.nl-item__unread-tag::before {
	content: '';
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background: #3b82f6;
}

.nl-item__content {
	margin-top: 10px;
	padding-top: 10px;
	border-top: 1px solid #e2e8f0;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.nl-field {
	display: flex;
	align-items: baseline;
	gap: 10px;
	font-size: 13px;
}

.nl-field__label {
	font-weight: 600;
	color: #334155;
	flex-shrink: 0;
	min-width: 64px;
	font-size: 12px;
}

.nl-field__value {
	color: #475569;
	flex: 1;
	word-break: break-word;
}

.nl-field__remark {
	font-size: 12px;
	color: #059669;
	line-height: 1.6;
	padding: 6px 10px;
	background: #f0fdf4;
	border-radius: 6px;
	border-left: 3px solid #10b981;
}

.nl-field__raw {
	font-size: 13px;
	color: #475569;
	line-height: 1.6;
}

.nl-item__actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 4px;

	a {
		font-size: 12px;
	}
}

.nl-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	color: #94a3b8;
	gap: 8px;
}

.nl-empty__text {
	font-size: 14px;
	font-weight: 600;
	color: #64748b;
	margin-top: 4px;
}

.nl-empty__sub {
	font-size: 12px;
	color: #94a3b8;
}

.nl-pagination {
	margin: 12px 16px;
	justify-content: flex-end;
	flex-shrink: 0;
	background: #ffffff;
	padding: 8px 0;
}

.nl-expand-enter-active,
.nl-expand-leave-active {
	transition: all 0.25s ease;
	overflow: hidden;
}

.nl-expand-enter-from,
.nl-expand-leave-to {
	opacity: 0;
	max-height: 0;
}

.nl-expand-enter-to,
.nl-expand-leave-from {
	opacity: 1;
	max-height: 500px;
}
</style>
