import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import api from '@/config/api';
import offlineDb from './offline_db';

/**
 * Asks once to send alerts, then saves this phone's Expo push token for the person and workplace open now, so guests'
 * orders and calls reach it while the app is closed. Saved on each start and switch (the server moves it along). Quiet
 * when it cannot: alerts turned off, no EAS project id in the build, or no internet.
 */
export default async function registerPush() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;
  // Android 13+ asks for the permission only once a channel exists.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('guests', {
      name: "Guests' orders and calls",
      importance: AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const allowed = current.granted || (current.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
  if (!allowed) return;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await api.post('/push-devices', { kind: 'expo', token });
  await offlineDb.set('push_token', token);
}
