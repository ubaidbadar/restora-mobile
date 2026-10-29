import { View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';
import type ThemeChoice from '@/types/theme_choice';
import Tabs from '@/ui/tabs';
import offlineDb from '@/utils/offline_db';

const CHOICES: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Automatic' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/** Light or dark: follow the phone (the start), or keep one. The choice is kept on this phone. */
export default function AppearanceSection() {
  const { theme, hasAdaptiveThemes } = useUniwind();

  return (
    <View className="p-3">
      <Tabs
        options={CHOICES}
        value={hasAdaptiveThemes ? 'system' : theme}
        onChange={(value) => {
          Uniwind.setTheme(value as ThemeChoice);
          void offlineDb.set('theme', value);
        }}
      />
    </View>
  );
}
