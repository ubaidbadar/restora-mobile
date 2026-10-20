import { useLocalSearchParams } from 'expo-router';
import Form from '@/ui/form';
import type Editing from './editing';
import OrderScreen from './order_screen';
import saveChanges from './save_changes';
import saveOrder from './save_order';
import orderSchema from './schema';

/**
 * Take an order: find the customer, tap dishes, place it. From a table (`?table=<id>`) it starts as dine-in there; from
 * a customer (`?customer=<id>`) with them picked. With `editing` it changes a placed order (pages/edit_order_page).
 */
export default function NewOrderPage({ editing }: { editing?: Editing }) {
  const { table, customer } = useLocalSearchParams<{ table?: string; customer?: string }>();
  const order = editing?.order;

  return (
    <Form
      className="flex-1 bg-canvas"
      schema={orderSchema}
      defaultValues={
        order
          ? {
              customerId: order.customerId,
              items: editing.items,
              type: order.type,
              tableId: order.tableId,
              tableName: order.tableName,
              area: order.area,
              address: order.address,
              rider: order.rider,
              deliveryFee: order.deliveryFee,
              discount: order.discount,
              paymentStatus: 'unpaid',
            }
          : { items: [], type: table ? 'dine_in' : 'takeaway', tableId: table, customerId: customer, paymentStatus: 'unpaid' }
      }
      onSubmit={(props) => (order ? saveChanges(order, props) : saveOrder(props))}
      component={(props) => <OrderScreen {...props} editing={editing} />}
    />
  );
}
