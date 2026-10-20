import Constants from 'expo-constants';

const devHost = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

/** The Restora web app (settings, staff, menu…), opened from More. Links in emails (reset password) land there too. */
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || `http://${devHost}:3000`;

export default WEB_URL;
