import { apiClient } from '../../lib/axiosClient';

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function isPushSupported(): Promise<boolean> {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!(await isPushSupported())) return null;
  const sw = await navigator.serviceWorker.ready;
  return sw.pushManager.getSubscription();
}

export async function subscribeToPush(): Promise<boolean> {
  if (!(await isPushSupported())) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const sw = await navigator.serviceWorker.ready;
  const sub = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC).buffer as ArrayBuffer,
  });

  const json = sub.toJSON();
  await apiClient.post('/api/v1/push/subscribe', {
    endpoint: json.endpoint,
    p256dh: json.keys!['p256dh'],
    auth: json.keys!['auth'],
  });

  return true;
}

export async function unsubscribeFromPush(): Promise<void> {
  const sw = await navigator.serviceWorker.ready;
  const sub = await sw.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
  }
  await apiClient.delete('/api/v1/push/subscribe');
}
