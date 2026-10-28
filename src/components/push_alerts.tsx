import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import registerPush from '@/utils/register_push';

/**
 * Alerts on this phone for guests' orders and calls (sent by the server while the app is closed or in the background).
 * Saves the phone for this workplace, and a tap on an alert opens its screen: the orders board, or the tables.
 */
export default function PushAlerts() {
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    registerPush().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!response) return;
    const screen = response.notification.request.content.data?.screen;
    if (screen === 'tables') router.navigate('/tables');
    if (screen === 'orders') router.navigate('/');
    Notifications.clearLastNotificationResponse();
  }, [response]);

  return null;
}
