import withOverlay from '@/hoc/withOverlay';
import type MenuAction from '@/types/menu_action';
import type OverlayProps from '@/types/overlay_props';
import afterSheetCloses from '@/utils/after_sheet_closes';
import MenuRows from './menu_rows';
import SheetPanel from './sheet_panel';

interface MenuPanelProps extends OverlayProps {
  title?: string;
  items: MenuAction[];
}

function MenuPanel({ title, items, ...tools }: MenuPanelProps) {
  return (
    <SheetPanel title={title} {...tools}>
      <MenuRows items={items} run={(action) => afterSheetCloses(tools.close, action)} />
    </SheetPanel>
  );
}

/**
 * A row's actions as a list in a bottom sheet: the row's long-press (and ⋯ on Android, through `ui/action_menu`):
 * `<MenuSheet title items component={({ open }) => <Pressable onLongPress={open}>…</Pressable>} />`
 */
const MenuSheet = withOverlay(MenuPanel);

export default MenuSheet;
