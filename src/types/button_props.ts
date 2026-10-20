import type { PressableProps } from 'react-native';
import type BUTTON_SIZES from '@/constants/button_sizes';
import type BUTTON_VARIANTS from '@/constants/button_variants';
import type IconName from './icon_name';

export default interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: string;
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  icon?: IconName;
  className?: string;
}
