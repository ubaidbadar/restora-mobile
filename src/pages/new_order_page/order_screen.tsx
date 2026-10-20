import { Stack } from 'expo-router';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import WIDE_WIDTH from '@/constants/wide_width';
import type FormComponentProps from '@/types/form_component_props';
import CartPanel from './cart_panel';
import CartSheet from './cart_sheet';
import CustomerStep from './customer_step';
import type Editing from './editing';
import LeaveGuard from './leave_guard';
import MenuPicker from './menu_picker';
import PlaceOrderBar from './place_order_bar';

/**
 * Phones: the customer and the menu fill the screen, the order waits in a bar at the bottom and opens in a sheet.
 * Tablets: the menu on the left, the order beside it, always in view.
 */
export default function OrderScreen({ editing, ...props }: FormComponentProps & { editing?: Editing }) {
  const wide = useWindowDimensions().width >= WIDE_WIDTH;
  const submitLabel = editing ? 'Save changes' : 'Place order';
  const customer = <CustomerStep {...props} picked={editing?.order.customer} />;

  return (
    <>
      <Stack.Screen options={{ title: editing ? `Edit order #${editing.order.dailyToken}` : 'New order' }} />
      <LeaveGuard control={props.control} message={props.message} />
      {wide ? (
        <View className="flex-1 flex-row">
          <View className="flex-1">
            <MenuPicker {...props} header={customer} wide />
          </View>
          <View className="w-96 border-s border-border bg-surface">
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerClassName="gap-5 p-5">
              <CartPanel {...props} editing={Boolean(editing)} />
            </ScrollView>
            <PlaceOrderBar {...props} submitLabel={submitLabel} />
          </View>
        </View>
      ) : (
        <>
          <MenuPicker {...props} header={customer} />
          <CartSheet {...props} editing={Boolean(editing)} submitLabel={submitLabel} />
        </>
      )}
    </>
  );
}
