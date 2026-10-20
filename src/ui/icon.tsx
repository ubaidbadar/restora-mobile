import Ionicons from '@expo/vector-icons/Ionicons';
import { withUniwind } from 'uniwind';
import type IconName from '@/types/icon_name';

const StyledIonicons = withUniwind(Ionicons);

interface IconProps {
  name: IconName;
  size?: number;
  /** The color as an accent class, e.g. `accent-muted`, `accent-on-primary`. */
  className?: string;
}

/** An icon in a theme color. Decorative: the control around it carries the label. */
export default function Icon({ name, size = 20, className = 'accent-muted' }: IconProps) {
  return <StyledIonicons name={name} size={size} colorClassName={className} accessibilityElementsHidden importantForAccessibility="no" />;
}
