// ─────────────────────────────────────────────────────────────────────────────
// KREAZY AI - DASHBOARD NOTIFICATIONS STORE
// Manages real-time & persistent notifications across the entire dashboard
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'kreazy_dashboard_notifications';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-welcome-1',
    title: 'Workspace Initialized',
    desc: 'Welcome to Kreazy AI Omnichannel Hub. Meta Cloud AI channels are ready for configuration.',
    time: 'Today',
    unread: false,
    type: 'system',
    link: '/dashboard/overview'
  }
];

export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse notifications from storage:', err);
  }
  return DEFAULT_NOTIFICATIONS;
}

export function saveNotifications(notifs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    // Dispatch global event for instant reactive UI updates
    window.dispatchEvent(new CustomEvent('kreazy_notification_update', { detail: notifs }));
  } catch (err) {
    console.warn('Failed to save notifications to storage:', err);
  }
}

export function addDashboardNotification({
  title,
  desc,
  type = 'payment',
  time = 'Just now',
  link = '/dashboard/billing'
}) {
  const current = getStoredNotifications();
  const newNotif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    desc,
    type,
    time,
    unread: true,
    link
  };

  const updated = [newNotif, ...current.filter(n => n.id !== newNotif.id).slice(0, 24)];
  saveNotifications(updated);
  return newNotif;
}

export function markAllNotificationsRead() {
  const current = getStoredNotifications();
  const updated = current.map(n => ({ ...n, unread: false }));
  saveNotifications(updated);
  return updated;
}

export function clearAllNotifications() {
  saveNotifications([]);
  return [];
}
