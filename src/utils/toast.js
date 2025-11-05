// Simple toast utility
let toastId = 0
const toasts = []
const listeners = []

export const toast = {
  success: (message) => addToast('success', message),
  error: (message) => addToast('error', message),
  info: (message) => addToast('info', message),
  warning: (message) => addToast('warning', message),
}

function addToast(type, message) {
  const id = toastId++
  const toast = { id, type, message }
  toasts.push(toast)
  notifyListeners()
  
  // Auto remove after 5 seconds unless persistent
  setTimeout(() => {
    removeToast(id)
  }, 5000)
  
  return id
}

export function removeToast(id) {
  const index = toasts.findIndex((t) => t.id === id)
  if (index > -1) {
    toasts.splice(index, 1)
    notifyListeners()
  }
}

export function subscribe(listener) {
  listeners.push(listener)
  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}

export function getToasts() {
  return [...toasts]
}

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]))
}

