import { router } from 'expo-router';
import can from '@shared/can';
import type Permission from '@shared/permission';
import useAuthStore from '@/store/auth_store';
import type IconName from '@/types/icon_name';
import MoreRow from './more_row';
import MoreSection from './more_section';

const PAGES: { icon: IconName; label: string; href: '/more/menu' | '/more/reservations' | '/more/staff' | '/more/printers'; permission: Permission }[] = [
  { icon: 'restaurant-outline', label: 'Menu', href: '/more/menu', permission: 'menu:view' },
  { icon: 'calendar-outline', label: 'Reservations', href: '/more/reservations', permission: 'reservations:view' },
  { icon: 'people-circle-outline', label: 'Staff', href: '/more/staff', permission: 'staff:view' },
  { icon: 'print-outline', label: 'Printers', href: '/more/printers', permission: 'devices:manage' },
];

/** Running the restaurant from the phone: the menu, bookings, the team and the printers, each with a back arrow to More. */
export default function ManageSection() {
  const workplace = useAuthStore((state) => state.me?.workplace);
  const pages = PAGES.filter((page) => can(workplace, page.permission));
  if (!pages.length) return null;

  return (
    <MoreSection title="Manage">
      {pages.map((page, index) => (
        <MoreRow key={page.href} first={index === 0} icon={page.icon} label={page.label} onPress={() => router.push(page.href)} />
      ))}
    </MoreSection>
  );
}
