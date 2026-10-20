import type AddonGroup from '@/types/addon_group';
import type CartItem from '@/types/cart_item';
import type MenuItem from '@/types/menu_item';

/** What a dish row or tile gets from the menu grid. */
export default interface DishProps {
  dish: MenuItem;
  /** The dish's add-on groups, in its order. */
  groups: AddonGroup[];
  /** This dish's lines in the cart. */
  lines: CartItem[];
  onAdd: (item: CartItem) => void;
  onQty: (key: string, qty: number) => void;
}
