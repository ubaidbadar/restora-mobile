import { Text, View } from 'react-native';

const VARIANTS = {
  neutral: { box: 'bg-sunken', text: 'text-body' },
  primary: { box: 'bg-primary-soft', text: 'text-accent-text' },
  success: { box: 'bg-success-50', text: 'text-success-700' },
  warning: { box: 'bg-warning-50', text: 'text-warning-800' },
  danger: { box: 'bg-danger-50', text: 'text-danger-700' },
  info: { box: 'bg-info-50', text: 'text-info-700' },
} as const;

interface BadgeProps {
  children: string;
  variant?: keyof typeof VARIANTS;
}

/** A short status label ("Paid", "Owes Rs 1,200"). The words carry the meaning, the color only helps. */
export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <View className={`self-start rounded-small px-2 py-0.5 ${VARIANTS[variant].box}`}>
      <Text numberOfLines={1} className={`text-xs font-semibold ${VARIANTS[variant].text}`}>
        {children}
      </Text>
    </View>
  );
}
