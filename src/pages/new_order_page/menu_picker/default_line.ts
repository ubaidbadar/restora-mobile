import type AddonGroup from '@/types/addon_group';
import type CartItem from '@/types/cart_item';
import type MenuItem from '@/types/menu_item';
import cartItemOf from '@/utils/cart_item_of';

/** One of the dish with its first size and, for required add-on groups, their first option. */
export default function defaultLine(dish: MenuItem, groups: AddonGroup[]): CartItem {
  return cartItemOf(dish, dish.sizes[0]!, groups.flatMap((group) => (group.min > 0 && group.options.length > 0 ? [group.options[0]!] : [])));
}
