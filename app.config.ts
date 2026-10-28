import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json is the app's config. Google sign-in's native module needs the iOS client's URL scheme at build time, so it is
// added only when EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is set (the Google button stays hidden on iPhone without it).
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
// Push alerts need the Expo project's id (`eas init` writes it into app.json, or set EAS_PROJECT_ID for the build), and
// on Android Firebase's google-services.json (its path in GOOGLE_SERVICES_JSON). Without them the app works, without alerts.
const projectId = process.env.EAS_PROJECT_ID;
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  extra: projectId ? { ...config.extra, eas: { ...config.extra?.eas, projectId } } : config.extra,
  android: googleServicesFile ? { ...config.android, googleServicesFile } : config.android,
  plugins: [
    ...(config.plugins ?? []),
    ...(iosClientId ? [['@react-native-google-signin/google-signin', { iosUrlScheme: `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}` }] as [string, object]] : []),
  ],
});
