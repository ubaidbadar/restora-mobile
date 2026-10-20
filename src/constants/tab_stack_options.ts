import type { NativeStackNavigationOptions } from 'expo-router';

/**
 * Every tab's stack. Its first screen draws its own title (components/page_header) and hides the native header;
 * screens pushed on top get the native header with a plain back arrow.
 */
const TAB_STACK_OPTIONS: NativeStackNavigationOptions = {
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  // iOS 26+ draws the header over the screen by default; a screen's first rows would sit under it until pulled down.
  headerTransparent: false,
};

export default TAB_STACK_OPTIONS;
