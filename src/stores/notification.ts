import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getNotificationList, getUnreadCount, confirmMessage } from '@/api/notification'
import { NotificationWebSocket } from '@/utils/websocket'
import { Session } from '@/utils/storage'
import $axios from '@/utils/http'
import router from '@/router'
import type { NotificationMessage, WebSocketMessage } from '@/types/notification'
import { MessageType } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const popupQueue = ref<NotificationMessage[]>([])
  const currentPopup = ref<NotificationMessage | null>(null)
  const isKickedOut = ref(false)

  let wsInstance: NotificationWebSocket | null = null

  const hasUnread = computed(() => unreadCount.value > 0)

  /** 初始化通知系统 */
  async function init() {
    await refreshUnreadCount()

    try {
      const res = await getNotificationList({
        messageType: MessageType.POPUP,
        isConfirmed: 0,
        pageSize: 100
      }) as any
      if (res.records?.length) {
        popupQueue.value = res.records.filter((r: any) => r.id !== currentPopup.value?.id)
      }
    } catch (err) {
      console.error('拉取离线弹窗失败', err)
    }

    if (!currentPopup.value) showNextPopup()
    connectWebSocket()
  }

  /** 刷新未读数 */
  async function refreshUnreadCount() {
    try {
      const res = await getUnreadCount() as any
      unreadCount.value = res.total
    } catch (err) {
      console.error('获取未读数失败', err)
    }
  }

  /** 连接 WebSocket */
  function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const base = $axios.defaults.baseURL || '/yi'
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}${base}/notification/websocket`

    wsInstance = new NotificationWebSocket(wsUrl, handleWebSocketMessage)
    wsInstance.connect()
  }

  /** WebSocket 消息处理 */
  function handleWebSocketMessage(msg: WebSocketMessage | any) {
    // 会话踢出特殊处理
    if (msg.type === 'SESSION_KICKOUT') {
      isKickedOut.value = true
      ElMessageBox.alert(msg.content || '您的账号在另一台设备登录', msg.title || '账号在另一处登录', {
        confirmButtonText: '重新登录',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'warning'
      }).then(() => {
        Session.clear()
        disconnect()
        router.replace('/login').catch(() => {
          window.location.href = '/login'
        })
      })
      return
    }

    if (msg.type === 'NEW_MESSAGE') {
      refreshUnreadCount()

      if (msg.data.messageType === 'POPUP') {
        const id = msg.data.id
        const isDuplicate = currentPopup.value?.id === id || popupQueue.value.some(p => p.id === id)
        if (!isDuplicate) {
          popupQueue.value.push(msg.data)
          if (!currentPopup.value) showNextPopup()
        }
      }
    }

    if (msg.type === 'ANNOUNCEMENT_PUBLISHED' || msg.type === 'ANNOUNCEMENT_REVOKED') {
      window.dispatchEvent(new CustomEvent('announcement-websocket', { detail: msg }))
    }
  }

  /** 显示下一个弹窗 */
  function showNextPopup() {
    if (popupQueue.value.length === 0) {
      currentPopup.value = null
      return
    }
    currentPopup.value = popupQueue.value.shift()!
  }

  /** 确认当前弹窗 */
  async function confirmCurrentPopup() {
    if (!currentPopup.value) return

    try {
      await confirmMessage(currentPopup.value.id)
      await refreshUnreadCount()
      showNextPopup()
    } catch (err) {
      console.error('确认弹窗失败', err)
    }
  }

  /** 断开 WebSocket */
  function disconnect() {
    isKickedOut.value = false
    wsInstance?.disconnect()
    wsInstance = null
  }

  return {
    unreadCount,
    hasUnread,
    currentPopup,
    popupQueue,
    isKickedOut,
    init,
    refreshUnreadCount,
    confirmCurrentPopup,
    disconnect
  }
})
