import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json is the app's config. Google sign-in's native module needs the iOS client's URL scheme at build time, so it is
// added only when EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is set (the Google button stays hidden on iPhone without it).
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
// Push alerts need the EAS project's id: `eas init` writes it into app.json, or set EAS_PROJECT_ID for the build.
const projectId = process.env.EAS_PROJECT_ID;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  extra: projectId ? { ...config.extra, eas: { ...config.extra?.eas, projectId } } : config.extra,
  plugins: [
    ...(config.plugins ?? []),
    ...(iosClientId ? [['@react-native-google-signin/google-signin', { iosUrlScheme: `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}` }] as [string, object]] : []),
  ],
});
