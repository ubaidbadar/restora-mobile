import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useCSSVariable } from 'uniwind';

const FONTS = {
  regular: { fontFamily: 'InstrumentSans-Regular', fontWeight: '400' as const },
  medium: { fontFamily: 'InstrumentSans-Medium', fontWeight: '500' as const },
  bold: { fontFamily: 'BricolageGrotesque-Bold', fontWeight: '700' as const },
  heavy: { fontFamily: 'BricolageGrotesque-Bold', fontWeight: '800' as const },
};

/**
 * Gestures, the keyboard, and the theme's colors for what React Native draws natively (headers, screen backgrounds).
 * Light or dark follows the phone, or More → Appearance: `Uniwind.setTheme` sets the app's appearance, so the status bar,
 * native headers and sheets switch with it (no status bar component: iOS 27 ignores app-set status bar styles).
 */
export default function ThemeRoot({ children }: { children: ReactNode }) {
  const [canvas, surface, ink, border, primary] = useCSSVariable(['--color-canvas', '--color-surface', '--color-ink', '--color-border', '--color-primary']) as string[];
  const base = useColorScheme() === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider value={{ ...base, colors: { ...base.colors, background: canvas!, card: surface!, text: ink!, border: border!, primary: primary! }, fonts: FONTS }}>
          {children}
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
