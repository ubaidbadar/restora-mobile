import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, Text, View } from 'react-native';
import useGet from '@/hooks/useGet';
import GoogleButton from './google_button';

/** Google's native sign-in needs the web client, on iPhone the iOS client too, and a build that has it inside (not Expo Go). */
const BUILT_IN =
  Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) &&
  (Platform.OS !== 'ios' || Boolean(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)) &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

/** "Continue with Google" above the email form, on sign in and create account. Shown only when the server has Google set up. */
export default function GoogleSignIn() {
  const { data } = useGet<{ app: string[] }>('/public/sign-in-providers', { active: !BUILT_IN });
  if (!BUILT_IN || !data?.app.includes('google')) return null;

  return (
    <View className="gap-4">
      <GoogleButton />
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text className="text-sm text-muted">or</Text>
        <View className="h-px flex-1 bg-border" />
      </View>
    </View>
  );
}
