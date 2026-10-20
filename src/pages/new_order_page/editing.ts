import type CartItem from '@/types/cart_item';
import type Order from '@/types/order';

/** A placed order being changed, and its lines as cart lines (pages/edit_order_page). */
export default interface Editing {
  order: Order;
  items: CartItem[];
}
