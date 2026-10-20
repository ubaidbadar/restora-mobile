import type Permission from '@shared/permission';
import type IconName from './icon_name';

/** A tab of the app (constants/tab_links): its route, words and icons, and who may open it. */
export default interface TabLink {
  /** The route group or folder in src/app/(app). */
  name: string;
  href: '/' | '/today' | '/customers' | '/tables';
  label: string;
  icon: IconName;
  activeIcon: IconName;
  permission: Permission;
}
