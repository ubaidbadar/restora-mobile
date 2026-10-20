import type TabLink from '@/types/tab_link';

/**
 * The tabs, in the web's order (constants/nav_links there). The bottom bar takes the first three someone may open, with
 * New order in the middle and More last; the others are rows in More.
 */
const TAB_LINKS: TabLink[] = [
  { name: 'today', href: '/today', label: 'Today', icon: 'grid-outline', activeIcon: 'grid', permission: 'reports:view' },
  { name: '(orders)', href: '/', label: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt', permission: 'orders:view' },
  { name: 'customers', href: '/customers', label: 'Customers', icon: 'people-outline', activeIcon: 'people', permission: 'customers:view' },
  { name: 'tables', href: '/tables', label: 'Tables', icon: 'restaurant-outline', activeIcon: 'restaurant', permission: 'tables:view' },
];

export default TAB_LINKS;
