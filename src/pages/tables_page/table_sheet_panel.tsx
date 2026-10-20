import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Can from '@/components/can';
import type FloorTable from '@/types/floor_table';
import type OverlayProps from '@/types/overlay_props';
import Badge from '@/ui/badge';
import Button from '@/ui/button';
import SheetPanel from '@/ui/sheet_panel';
import afterSheetCloses from '@/utils/after_sheet_closes';
import formatRs from '@/utils/format_rs';
import formatTime from '@/utils/format_time';
import minutesSince from '@/utils/minutes_since';
import TableOrderRow from './table_order_row';
import TableQr from './table_qr';
import tableStatus from './table_status';

interface TableSheetPanelProps extends OverlayProps {
  table: FloorTable;
  onAnswer: (requestId: string) => void;
}

const BADGES = { error: 'danger', warning: 'warning', primary: 'primary', info: 'info', neutral: 'neutral' } as const;

/**
 * One table now: what it needs, calls to answer, its orders (each opens in full), what is left to collect, the next
 * booking, and the main action: a new order for it.
 */
export default function TableSheetPanel({ table, onAnswer, ...overlay }: TableSheetPanelProps) {
  const status = tableStatus(table);
  const toCollect = table.orders.filter((order) => order.paymentStatus === 'unpaid').reduce((sum, order) => sum + order.total, 0);

  const newOrder = () => afterSheetCloses(overlay.close, () => router.push({ pathname: '/order/new', params: { table: table._id } }));

  return (
    <SheetPanel {...overlay} title={`Table ${table.name}`}>
      <View className="flex-row flex-wrap items-center gap-2">
        <Badge variant={BADGES[status.tone]}>{status.label}</Badge>
        {status.detail && <Text className="text-sm text-body">{status.detail}</Text>}
        {(table.section || table.seats) && <Text className="text-sm text-muted">· {[table.section, table.seats && `${table.seats} seats`].filter(Boolean).join(' · ')}</Text>}
      </View>

      {table.requests.map((request) => (
        <View key={request._id} className="flex-row items-center justify-between gap-3 rounded-control bg-warning-50 py-2 ps-3 pe-2">
          <Text className="flex-1 text-sm font-medium text-warning-800">
            {request.type === 'bill' ? 'Asked for the bill' : 'Called a waiter'} · {minutesSince(request.createdAt)} min ago
          </Text>
          <Button size="sm" onPress={() => onAnswer(request._id)}>
            Done
          </Button>
        </View>
      ))}

      {table.orders.length > 0 && (
        <View>
          {table.orders.map((order) => (
            <TableOrderRow key={order._id} order={order} />
          ))}
          {toCollect > 0 && (
            <View className="mt-2 flex-row justify-between border-t border-border pt-3">
              <Text className="text-sm text-muted">To collect</Text>
              <Text className="text-sm font-semibold text-ink">{formatRs(toCollect)}</Text>
            </View>
          )}
        </View>
      )}

      {table.booking && (
        <Text className="rounded-control bg-info-50 px-3 py-2.5 text-sm text-info-800">
          Booked for {formatTime(table.booking.dateTime)} · {table.booking.partySize} people
        </Text>
      )}

      <Can permission="orders:create">
        <Button size="lg" icon="add" onPress={newOrder}>
          {`New order for ${table.name}`}
        </Button>
      </Can>
      <TableQr table={table} component={({ open }) => <Button variant="ghost" icon="qr-code-outline" onPress={open}>Show QR code</Button>} />
    </SheetPanel>
  );
}
