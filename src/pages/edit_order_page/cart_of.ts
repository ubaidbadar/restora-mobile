import type CartItem from '@/types/cart_item';
import type Menu from '@/types/menu';
import type Order from '@/types/order';
import cartItemOf from '@/utils/cart_item_of';

/**
 * A placed order's lines as cart lines, matched to the menu by the size and add-on ids kept on the order (by name for
 * older orders that lack them). A dish no longer on the menu stays as it was; the server says so when saving.
 */
export default function cartOf(order: Order, menu: Menu): CartItem[] {
  const lines = new Map<string, CartItem>();
  order.items.forEach((line, index) => {
    const dish = menu.items.find((item) => item._id === line.itemId);
    const size = dish && (dish.sizes.find((s) => s._id === line.sizeId) ?? dish.sizes.find((s) => (s.name || undefined) === line.sizeName) ?? dish.sizes[0]);
    if (!dish || !size) {
      lines.set(`gone-${index}`, { ...line, key: `gone-${index}`, addonIds: line.addonIds ?? [] });
      return;
    }
    const options = menu.addonGroups.filter((group) => dish.addonGroupIds.includes(group._id)).flatMap((group) => group.options);
    const addons = line.addonIds ? options.filter((option) => line.addonIds!.includes(option._id)) : options.filter((option) => line.addons?.some((addon) => addon.name === option.name));
    const cart = cartItemOf(dish, size, addons, line.note);
    // The same dish, size, add-ons and note twice is one line.
    const same = lines.get(cart.key);
    lines.set(cart.key, { ...cart, price: line.price, menuPrice: line.menuPrice ?? line.price, qty: (same?.qty ?? 0) + line.qty });
  });
  return [...lines.values()];
}
