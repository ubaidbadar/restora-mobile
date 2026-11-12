import { View } from 'react-native';
import OrderView from '@/components/order_view';
import type MenuAction from '@/types/menu_action';
import type Order from '@/types/order';
import type OverlayTrigger from '@/types/overlay_trigger';
import Button from '@/ui/button';
import MenuRows from '@/ui/menu_rows';
import Sheet from '@/ui/sheet';
import afterSheetCloses from '@/utils/after_sheet_closes';

interface OrderDetailsSheetProps {
  order: Order;
  /** The next step ("Mark ready"), as the main button. */
  advance?: { label: string; onPress: () => void };
  /** Record payment, beside it. */
  onPay?: () => void;
  /** The other actions (edit, print, cancel), as rows under the buttons. */
  actions: MenuAction[];
  component: OverlayTrigger;
}

/** Tapping an order card: everything about the order, and what can be done with it next. */
export default function OrderDetailsSheet({ order, advance, onPay, actions, component }: OrderDetailsSheetProps) {
  return (
    <Sheet title={`Order #${order.dailyToken}`} component={component}>
      {({ close }) => (
        <>
          <OrderView order={order} />
          {(advance || onPay) && (
            <View className="flex-row gap-2">
              {onPay && (
                <Button variant="outline" size="lg" icon="cash-outline" className="flex-1" onPress={() => afterSheetCloses(close, onPay)}>
                  Pay
                </Button>
              )}
              {advance && (
                <Button size="lg" icon="arrow-forward" className="flex-1" onPress={() => afterSheetCloses(close, advance.onPress)}>
                  {advance.label}
                </Button>
              )}
            </View>
          )}
          <View>
            <MenuRows items={actions} run={(action) => afterSheetCloses(close, action)} />
          </View>
        </>
      )}
    </Sheet>
  );
}
