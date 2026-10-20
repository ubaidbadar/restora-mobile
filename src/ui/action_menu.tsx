import type MenuAction from '@/types/menu_action';
import IconButton from './icon_button';
import MenuSheet from './menu_sheet';

interface ActionMenuProps {
  /** Read out for the ⋯ button ("More actions for order 12"). */
  label: string;
  title?: string;
  items: MenuAction[];
}

/** The ⋯ button of a row: its actions in a bottom sheet, the same list as the row's long-press. */
export default function ActionMenu({ label, title, items }: ActionMenuProps) {
  return <MenuSheet title={title} items={items} component={({ open }) => <IconButton icon="ellipsis-horizontal" label={label} size="sm" onPress={open} />} />;
}
