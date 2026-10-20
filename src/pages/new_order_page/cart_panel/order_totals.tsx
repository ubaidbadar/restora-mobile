import { useWatch } from 'react-hook-form';
import TotalsList from '@/components/totals_list';
import ORDER_TOTAL_FIELDS from '@/constants/order_total_fields';
import useAuthStore from '@/store/auth_store';
import type FormComponentProps from '@/types/form_component_props';
import orderTotalsOf from '@/utils/order_totals_of';

/** Subtotal, discount, tax and delivery, worked out from the watched order fields. */
export default function OrderTotals({ control }: FormComponentProps) {
  const watched = useWatch({ control, name: [...ORDER_TOTAL_FIELDS] });
  const { totals, taxRate, deliveryFee } = orderTotalsOf(watched, useAuthStore.getState().me!.workplace!.settings.taxByPaymentMethod);
  return <TotalsList totals={totals} taxRate={taxRate} deliveryFee={deliveryFee} />;
}
