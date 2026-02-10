/**
 * Push notification system for daily journal reminders
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    // Use service worker registration for PWA notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'aramis-reminder',
        });
      }).catch(() => {
        // Fallback to regular notification
        new Notification(title, { body, icon: '/icons/icon-192.png' });
      });
    } else {
      new Notification(title, { body, icon: '/icons/icon-192.png' });
    }
  }
}

let reminderInterval: ReturnType<typeof setInterval> | null = null;

export function scheduleDailyReminder(hour: number = 21) {
  // Clear any existing interval
  if (reminderInterval) clearInterval(reminderInterval);

  // Check every minute
  reminderInterval = setInterval(() => {
    const now = new Date();
    const lastReminder = localStorage.getItem('aramis_lastReminderDate');
    const today = now.toDateString();

    if (lastReminder !== today && now.getHours() === hour && now.getMinutes() === 0) {
      showNotification(
        'Aramis',
        'Time to reflect on your day. Your journal awaits.'
      );
      localStorage.setItem('aramis_lastReminderDate', today);
    }
  }, 60000);

  return () => {
    if (reminderInterval) clearInterval(reminderInterval);
  };
}

export function stopDailyReminder() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}
