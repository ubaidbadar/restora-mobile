import { Pressable, Text } from 'react-native';
import BUTTON_SIZES from '@/constants/button_sizes';
import BUTTON_VARIANTS from '@/constants/button_variants';
import type ButtonProps from '@/types/button_props';
import Icon from './icon';

/** A button with a label (and an icon before it). No loading prop: pass `disabled` while saving, and change the label. */
export default function Button({ children, variant = 'primary', size = 'md', icon, className = '', disabled, ...props }: ButtonProps) {
  const look = BUTTON_VARIANTS[variant];
  const scale = BUTTON_SIZES[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-control ${scale.container} ${look.container} ${disabled ? 'opacity-50' : ''} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={scale.icon} className={look.icon} />}
      <Text numberOfLines={1} className={`font-semibold ${scale.text} ${look.text}`}>
        {children}
      </Text>
    </Pressable>
  );
}
