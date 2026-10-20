import { Pressable, Text } from 'react-native';
import type MenuAction from '@/types/menu_action';
import Icon from './icon';

/** Actions as tappable rows inside a sheet. `run` closes the sheet first, then does the action. */
export default function MenuRows({ items, run }: { items: MenuAction[]; run: (action: () => void) => void }) {
  return items
    .filter((item) => !item.hidden)
    .map((item) => (
      <Pressable
        key={item.label}
        accessibilityRole="button"
        disabled={item.disabled}
        onPress={() => run(item.onPress)}
        className={`-mx-2 min-h-13 flex-row items-center gap-4 rounded-control px-3 active:bg-hover ${item.disabled ? 'opacity-40' : ''}`}
      >
        <Icon name={item.icon} size={22} className={item.destructive ? 'accent-danger-700' : 'accent-body'} />
        <Text className={`flex-1 text-base ${item.destructive ? 'text-danger-700' : 'text-ink'}`}>{item.label}</Text>
      </Pressable>
    ));
}
