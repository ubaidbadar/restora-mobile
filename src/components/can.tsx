import type { ReactNode } from 'react';
import type Permission from '@shared/permission';
import can from '@shared/can';
import useAuthStore from '@/store/auth_store';

interface CanProps {
  permission: Permission;
  children: ReactNode;
}

/** Shows its children only to people with the permission. The server checks again. */
export default function Can({ permission, children }: CanProps) {
  return can(useAuthStore((state) => state.me?.workplace), permission) ? children : null;
}
