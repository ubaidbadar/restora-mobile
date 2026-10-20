import { useEffect } from 'react';
import { router, useNavigation, usePreventRemove } from 'expo-router';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import confirm from '@/utils/confirm';

/**
 * Asks before a started order is thrown away (back button, back swipe). Once it is saved (`message` is '') it goes
 * back to the board by itself.
 */
export default function LeaveGuard({ control, message }: Pick<FormComponentProps, 'control' | 'message'>) {
  const count = (useWatch({ control, name: 'items' }) ?? []).length;
  const navigation = useNavigation();
  const saved = message === '';

  // After the order sheet (phones) has slid away.
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => router.back(), 450);
    return () => clearTimeout(timer);
  }, [saved]);

  usePreventRemove(count > 0 && !saved, ({ data }) =>
    void confirm({ title: 'Discard this order?', message: 'The dishes you picked will be lost.', confirmLabel: 'Discard', destructive: true }).then(
      (ok) => ok && navigation.dispatch(data.action)
    )
  );
  return null;
}
