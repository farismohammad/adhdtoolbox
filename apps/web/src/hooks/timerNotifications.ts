export function canUseNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function hasNotificationPermission() {
  return canUseNotifications() && Notification.permission === 'granted'
}

/** Asks for permission if needed. Resolves to whether notifications can be shown. */
export async function requestNotificationPermission() {
  if (!canUseNotifications()) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  try {
    return (await Notification.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

export function showTimeUpNotification(body: string) {
  if (!hasNotificationPermission()) {
    return
  }

  try {
    const notification = new Notification("Time's up", {
      body,
      tag: 'adhdtoolbox-timer',
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch {
    // Some mobile browsers only allow notifications from a service worker.
  }
}
