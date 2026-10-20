import type { SFSymbol } from 'sf-symbols-typescript';
import type IconName from './icon_name';

/** One action in a row's menu (`ui/action_menu` on ⋯, `ui/menu_sheet` on long-press). */
export default interface MenuAction {
  label: string;
  icon: IconName;
  /** The SF Symbol for a native iOS menu, kept for when one is used again (it crashed in the app, so ⋯ uses the sheet). */
  symbol: SFSymbol;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}
