import { TextInput, type TextInputProps, View } from 'react-native';
import Icon from './icon';

/** The platform's search box look: a filled, rounded field with a magnifier and a clear button while typing. */
export default function SearchField(props: TextInputProps & { accessibilityLabel: string }) {
  return (
    <View className="min-h-11 flex-row items-center gap-2 rounded-control bg-sunken ps-3">
      <Icon name="search" size={18} />
      <TextInput
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        spellCheck={false}
        placeholderTextColorClassName="accent-subtle"
        selectionColorClassName="accent-primary"
        cursorColorClassName="accent-primary"
        className="min-h-11 flex-1 pe-3 text-base text-ink"
        {...props}
      />
    </View>
  );
}
