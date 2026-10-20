import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

/** An Ionicons name, e.g. 'add', 'print-outline', 'logo-whatsapp'. */
type IconName = ComponentProps<typeof Ionicons>['name'];

export default IconName;
