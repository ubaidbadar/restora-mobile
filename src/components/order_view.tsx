import { useState } from 'react';
import { View } from 'react-native';
import type Order from '@/types/order';
import Tabs from '@/ui/tabs';
import OrderDetails from './order_details';
import OrderTimeline from './order_timeline';

const TABS = [
  { value: 'details', label: 'Details' },
  { value: 'history', label: 'History' },
];

/** One order, either its current details or everything that happened to it. */
export default function OrderView({ order }: { order: Order }) {
  const [tab, setTab] = useState('details');

  return (
    <View className="gap-4">
      <Tabs options={TABS} value={tab} onChange={setTab} />
      {tab === 'history' ? <OrderTimeline order={order} /> : <OrderDetails order={order} />}
    </View>
  );
}
