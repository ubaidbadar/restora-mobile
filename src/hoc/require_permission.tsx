import type { ReactNode } from 'react';
import type Permission from '@shared/permission';
import can from '@shared/can';
import EmptyState from '@/components/empty_state';
import useAuthStore from '@/store/auth_store';

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
}

/** A screen for people with the permission; everyone else is told it is not for their role. */
export default function RequirePermission({ permission, children }: RequirePermissionProps) {
  if (can(useAuthStore((state) => state.me?.workplace), permission)) return children;
  return <EmptyState icon="lock-closed-outline" title="Not for your role" text="Ask the owner or a manager if you need this." />;
}
