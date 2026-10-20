import type { ReactNode } from 'react';
import type Order from '@/types/order';

/** What the board's parts pass down: the orders, and how to refresh or update one. */
export default interface BoardProps {
  orders: Order[];
  /** The page title, first in the scroll view. */
  header: ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  onOrderUpdated: (order: Order) => void;
}
