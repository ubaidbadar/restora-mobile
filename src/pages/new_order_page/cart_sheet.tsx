import { Pressable, Text, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ORDER_TOTAL_FIELDS from '@/constants/order_total_fields';
import ORDER_TYPE_LABELS from '@/constants/order_type_labels';
import useAuthStore from '@/store/auth_store';
import type FormComponentProps from '@/types/form_component_props';
import Icon from '@/ui/icon';
import Sheet from '@/ui/sheet';
import formatRs from '@/utils/format_rs';
import orderTotalsOf from '@/utils/order_totals_of';
import CartPanel from './cart_panel';
import CloseWhenSaved from './close_when_saved';
import PlaceOrderBar from './place_order_bar';

interface CartSheetProps extends FormComponentProps {
  editing: boolean;
  submitLabel: string;
}

/** Phones: the order so far in a bar at the bottom; once a dish is in, tapping it opens the order to finish and place it. */
export default function CartSheet({ editing, submitLabel, ...props }: CartSheetProps) {
  const watched = useWatch({ control: props.control, name: [...ORDER_TOTAL_FIELDS] });
  const bottom = useSafeAreaInsets().bottom;
  const taxByPaymentMethod = useAuthStore.getState().me!.workplace!.settings.taxByPaymentMethod;
  const { totals, itemCount, type } = orderTotalsOf(watched, taxByPaymentMethod);

  return (
    <Sheet
      full
      title="Order"
      footer={<PlaceOrderBar {...props} submitLabel={submitLabel} />}
      component={({ open }) => (
        // Clear of the home indicator or gesture bar, and far enough in that the screen's rounded corners never clip it.
        <View style={{ paddingBottom: Math.max(bottom + 8, 12) }} className="absolute inset-x-0 bottom-0 px-3 pt-2">
          {itemCount ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Order: ${itemCount} items, ${formatRs(totals.total)}. Open to finish.`}
              onPress={open}
              className="min-h-14 flex-row items-center gap-3 rounded-panel bg-primary px-4 active:bg-primary-hover"
            >
              <Text className="min-w-7 rounded-small bg-primary-hover px-1.5 py-0.5 text-center text-sm font-bold text-on-primary">{itemCount}</Text>
              <Text className="text-base font-bold text-on-primary">{formatRs(totals.total)}</Text>
              <Text numberOfLines={1} className="flex-1 text-sm text-on-primary opacity-80">
                {ORDER_TYPE_LABELS[type]}
              </Text>
              <Text className="text-sm font-semibold text-on-primary">View order</Text>
              <Icon name="chevron-forward" size={18} className="accent-on-primary" />
            </Pressable>
          ) : (
            // Nothing to review yet: the bar only says how to start, and the sheet stays closed.
            <View className="min-h-14 items-center justify-center rounded-panel border border-border bg-surface px-4 shadow-lg">
              <Text className="text-sm text-muted">Tap a dish to start the order</Text>
            </View>
          )}
        </View>
      )}
    >
      {({ close }) => (
        <>
          <CloseWhenSaved saved={props.message === ''} close={close} />
          <CartPanel {...props} editing={editing} heading={false} />
        </>
      )}
    </Sheet>
  );
}
