import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { acknowledgeAnnouncement, getPendingAnnouncements } from '@/api/announcement'
import type { AnnouncementSocketEvent, PendingAnnouncement } from '@/types/announcement'

export const useAnnouncementStore = defineStore('announcement', () => {
  const queue = ref<PendingAnnouncement[]>([])
  const current = ref<PendingAnnouncement | null>(null)
  const initialized = ref(false)
  let eventHandler: ((event: Event) => void) | null = null

  const visible = computed(() => current.value !== null)

  function sortAnnouncements(items: PendingAnnouncement[]) {
    return [...items].sort((a, b) => {
      const timeDiff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      return timeDiff || b.id - a.id
    })
  }

  function enqueue(items: PendingAnnouncement[]) {
    const knownIds = new Set<number>([
      ...(current.value ? [current.value.id] : []),
      ...queue.value.map((item) => item.id),
    ])
    queue.value = sortAnnouncements([
      ...queue.value,
      ...items.filter((item) => !knownIds.has(item.id)),
    ])
    showNext()
  }

  async function refreshPending() {
    const response = await getPendingAnnouncements() as unknown as PendingAnnouncement[]
    enqueue(response || [])
  }

  function showNext() {
    if (current.value || queue.value.length === 0) return
    current.value = queue.value.shift() || null
  }

  function handleSocketEvent(event: AnnouncementSocketEvent) {
    if (event.type === 'ANNOUNCEMENT_PUBLISHED') {
      void refreshPending().catch((error) => console.error('刷新系统公告失败', error))
      return
    }
    const id = event.data.announcementId
    queue.value = queue.value.filter((item) => item.id !== id)
    if (current.value?.id === id) {
      current.value = null
      showNext()
    }
  }

  async function init() {
    if (initialized.value) return
    initialized.value = true
    eventHandler = (event) => handleSocketEvent((event as CustomEvent<AnnouncementSocketEvent>).detail)
    window.addEventListener('announcement-websocket', eventHandler)
    try {
      await refreshPending()
    } catch (error) {
      console.error('加载待确认系统公告失败', error)
    }
  }

  async function acknowledgeCurrent() {
    if (!current.value) return
    const id = current.value.id
    await acknowledgeAnnouncement(id)
    if (current.value?.id === id) {
      current.value = null
      showNext()
    }
  }

  function disconnect() {
    if (eventHandler) window.removeEventListener('announcement-websocket', eventHandler)
    eventHandler = null
    initialized.value = false
    queue.value = []
    current.value = null
  }

  return { queue, current, visible, initialized, init, disconnect, refreshPending, acknowledgeCurrent }
})
