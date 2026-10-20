import { Pressable, Text, View } from 'react-native';

interface MenuChoiceProps {
  title: string;
  description: string;
  /** Small labels, e.g. the sample menu's categories. */
  tags?: string[];
  recommended?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

/** One way to start the menu, as a large card: choosing it finishes the setup. */
export default function MenuChoice({ title, description, tags, recommended = false, disabled = false, onPress }: MenuChoiceProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`gap-2 rounded-card border p-4 ${recommended ? 'border-primary bg-primary-soft' : 'border-border bg-surface'} ${disabled ? 'opacity-60' : 'active:opacity-80'}`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-base font-semibold text-ink">{title}</Text>
        {recommended && <Text className="rounded-small bg-primary px-2 py-0.5 text-xs font-semibold text-on-primary">Recommended</Text>}
      </View>
      <Text className="text-sm text-body">{description}</Text>
      {tags && (
        <View className="flex-row flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Text key={tag} className="rounded-small bg-surface px-2 py-0.5 text-xs text-muted">
              {tag}
            </Text>
          ))}
        </View>
      )}
    </Pressable>
  );
}
