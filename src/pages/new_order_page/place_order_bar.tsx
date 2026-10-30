import { Text, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import useSafeSpace from '@/hooks/useSafeSpace';
import ORDER_TOTAL_FIELDS from '@/constants/order_total_fields';
import useAuthStore from '@/store/auth_store';
import type FormComponentProps from '@/types/form_component_props';
import Button from '@/ui/button';
import formatRs from '@/utils/format_rs';
import orderTotalsOf from '@/utils/order_totals_of';

interface PlaceOrderBarProps extends FormComponentProps {
  submitLabel: string;
}

/** The foot of the order: why the server refused it (if it did), the total, and the button that places it. */
export default function PlaceOrderBar({ control, loading, error, onSubmit, submitLabel }: PlaceOrderBarProps) {
  const space = useSafeSpace();
  const watched = useWatch({ control, name: [...ORDER_TOTAL_FIELDS] });
  const taxByPaymentMethod = useAuthStore.getState().me!.workplace!.settings.taxByPaymentMethod;
  const { totals, itemCount } = orderTotalsOf(watched, taxByPaymentMethod);

  return (
    // A little above the home indicator or gesture bar, so the total and the button stay clear of the rounded corners.
    <View style={{ paddingBottom: space.bottom, paddingHorizontal: space.sides + 20 }} className="gap-2 border-t border-border bg-surface pt-3">
      {error && (
        <Text accessibilityRole="alert" className="text-sm font-medium text-danger-700">
          {error}
        </Text>
      )}
      <View className="flex-row items-center justify-between gap-3">
        <View accessibilityLiveRegion="polite">
          <Text className="text-sm text-muted">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
          <Text className="text-display font-bold text-ink">{formatRs(totals.total)}</Text>
        </View>
        <Button size="lg" className="flex-1" disabled={loading} onPress={onSubmit}>
          {loading ? 'Saving…' : submitLabel}
        </Button>
      </View>
    </View>
  );
}
