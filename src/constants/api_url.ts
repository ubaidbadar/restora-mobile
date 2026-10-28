import Constants from 'expo-constants';

// In development the API runs on the computer that runs `expo start`: a phone on the same Wi-Fi reaches it by that
// computer's address (Metro's host), the Android emulator too. A release build talks to the live server over HTTPS,
// unless EXPO_PUBLIC_API_URL names another one.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

/** The Restora server, e.g. `http://192.168.1.20:5001`. Requests go to `${API_URL}/api/v1`. */
const API_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? `http://${devHost}:5001` : 'https://restora.live');

export default API_URL;
