import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json is the app's config. Google sign-in's native module needs the iOS client's URL scheme at build time, so it is
// added only when EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is set (the Google button stays hidden on iPhone without it).
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
// Expo's project ID is configured in app.json (extra.eas.projectId).
// Android Firebase google-services.json can be added at build time through GOOGLE_SERVICES_JSON.
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  android: googleServicesFile ? { ...config.android, googleServicesFile } : config.android,
  plugins: [
    ...(config.plugins ?? []),
    ...(iosClientId ? [['@react-native-google-signin/google-signin', { iosUrlScheme: `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}` }] as [string, object]] : []),
  ],
});
