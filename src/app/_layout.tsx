import '@/global.css';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import * as SplashScreen from 'expo-splash-screen';
import Snackbar from '@/components/snackbar';
import ThemeRoot from '@/hoc/theme_root';
import useAuthStore from '@/store/auth_store';
import startApp from '@/utils/start_app';

void SplashScreen.preventAutoHideAsync();
startApp();

/**
 * Who sees what. Nobody signed in: sign in. Signed in without a restaurant, or the owner before the first-run setup:
 * the start screens. Everyone else: the app. The splash stays up until `/me` is known and fonts are ready.
 */
export default function RootLayout() {
  const me = useAuthStore((state) => state.me);
  // Light icons on dark screens, dark on light (Uniwind.setTheme changes the scheme, so a pinned theme counts too).
  const scheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    'InstrumentSans-Regular': InstrumentSans_400Regular,
    'InstrumentSans-Medium': InstrumentSans_500Medium,
    'InstrumentSans-SemiBold': InstrumentSans_600SemiBold,
    'InstrumentSans-Bold': InstrumentSans_700Bold,
    'BricolageGrotesque-SemiBold': BricolageGrotesque_600SemiBold,
    'BricolageGrotesque-Bold': BricolageGrotesque_700Bold,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
  });

  useEffect(() => {
    if (me !== undefined && fontsLoaded) void SplashScreen.hideAsync();
  }, [me, fontsLoaded]);

  if (me === undefined || !fontsLoaded) return null;
  const workplace = me?.workplace;
  const ready = Boolean(workplace) && !(workplace?.isPrimaryOwner && !workplace.settings.taxSet);

  return (
    <ThemeRoot>
      <Stack screenOptions={{ headerShown: false, statusBarStyle: scheme === 'dark' ? 'light' : 'dark' }}>
        <Stack.Protected guard={!me}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={Boolean(me) && !ready}>
          <Stack.Screen name="(start)" />
        </Stack.Protected>
        <Stack.Protected guard={ready}>
          <Stack.Screen name="(app)" />
          {/* Above the tabs: taking an order gets the whole screen (app/order/_layout). */}
          <Stack.Screen name="order" />
        </Stack.Protected>
      </Stack>
      <Snackbar />
    </ThemeRoot>
  );
}
