import { Pressable, type PressableProps } from 'react-native';
import type IconName from '@/types/icon_name';
import Icon from './icon';

const VARIANTS = {
  ghost: { container: 'active:bg-hover', icon: 'accent-muted' },
  outline: { container: 'border border-border-strong bg-surface active:bg-sunken', icon: 'accent-ink' },
  soft: { container: 'bg-primary-soft active:opacity-80', icon: 'accent-accent-text' },
  primary: { container: 'bg-primary active:bg-primary-hover', icon: 'accent-on-primary' },
  danger: { container: 'bg-danger-50 active:bg-danger-100', icon: 'accent-danger-700' },
} as const;

const SIZES = {
  sm: { container: 'size-9', icon: 18 },
  md: { container: 'size-11', icon: 22 },
} as const;

interface IconButtonProps extends Omit<PressableProps, 'children'> {
  icon: IconName;
  /** What it does, read out by screen readers ("Print order 12"). */
  label: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
}

/** A round icon-only button. `sm` keeps a 44pt tap area through hitSlop. */
export default function IconButton({ icon, label, variant = 'ghost', size = 'md', className = '', disabled, ...props }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={size === 'sm' ? 6 : 0}
      className={`items-center justify-center rounded-control ${SIZES[size].container} ${VARIANTS[variant].container} ${disabled ? 'opacity-40' : ''} ${className}`}
      {...props}
    >
      <Icon name={icon} size={SIZES[size].icon} className={VARIANTS[variant].icon} />
    </Pressable>
  );
}
