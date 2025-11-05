import { create } from 'zustand'

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  
  setNotifications: (notifications) => {
    const unread = notifications.filter((n) => !n.read).length
    set({ notifications, unreadCount: unread })
  },
  
  addNotification: (notification) => {
    set((state) => {
      const updated = [notification, ...state.notifications]
      const unread = updated.filter((n) => !n.read).length
      return { notifications: updated, unreadCount: unread }
    })
  },
  
  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      const unread = updated.filter((n) => !n.read).length
      return { notifications: updated, unreadCount: unread }
    })
  },
  
  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }))
      return { notifications: updated, unreadCount: 0 }
    })
  },
}))

export { useNotificationStore }

