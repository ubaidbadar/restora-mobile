import { Text, View } from 'react-native';
import CANCEL_REASON_LABELS from '@/constants/cancel_reason_labels';
import ORDER_TYPE_LABELS from '@/constants/order_type_labels';
import PAYMENT_LABELS from '@/constants/payment_labels';
import STATUS_LABELS from '@/constants/status_labels';
import useGet from '@/hooks/useGet';
import type AuditEntry from '@/types/audit_entry';
import type CancelReason from '@/types/cancel_reason';
import type LineChange from '@/types/line_change';
import type Order from '@/types/order';
import type OrderType from '@/types/order_type';
import type OrderStatus from '@/types/order_status';
import type PaymentMethod from '@/types/payment_method';
import Button from '@/ui/button';
import formatDate from '@/utils/format_date';
import formatRs from '@/utils/format_rs';
import formatTime from '@/utils/format_time';
import SkeletonList from './skeleton_list';

const FIELDS: { key: string; label: string; format: (value: unknown) => string }[] = [
  { key: 'type', label: 'Order type', format: (value) => ORDER_TYPE_LABELS[value as OrderType] ?? String(value) },
  { key: 'tableName', label: 'Table', format: String },
  { key: 'customer', label: 'Customer', format: String },
  { key: 'area', label: 'Area', format: String },
  { key: 'address', label: 'Address', format: String },
  { key: 'rider', label: 'Rider', format: String },
  { key: 'discount', label: 'Discount', format: (value) => formatRs(Number(value)) },
  { key: 'deliveryFee', label: 'Delivery', format: (value) => formatRs(Number(value)) },
  { key: 'total', label: 'Total', format: (value) => formatRs(Number(value)) },
];

function TimelineEntry({ entry, orderAt }: { entry: AuditEntry; orderAt: string }) {
  const before = entry.changes?.before ?? {};
  const after = entry.changes?.after ?? {};
  const lines = Array.isArray(after.lines) ? after.lines as LineChange[] : [];
  const status = after.status as OrderStatus | undefined;
  const paymentMethod = after.paymentMethod as PaymentMethod | undefined;
  const khata = after.paymentStatus === 'khata';
  const reasons = [after.reason && after.reason !== 'other' ? CANCEL_REASON_LABELS[after.reason as CancelReason] : undefined, after.note].filter(Boolean).join(' · ');
  const accepted = before.status === 'pending' && status === 'new';

  const title = entry.action === 'order.created' ? 'Placed'
    : entry.action === 'order.edited' || entry.action === 'order.updated' ? 'Changed'
    : entry.action === 'order.status_updated' ? accepted ? 'Accepted' : `Marked ${status ? STATUS_LABELS[status] ?? status : 'updated'}`
    : entry.action === 'order.payment_recorded' ? khata ? 'Added to khata' : `Paid · ${paymentMethod ? PAYMENT_LABELS[paymentMethod] : ''}`
    : entry.action === 'order.cancelled' ? 'Cancelled' : entry.action;

  const tone = entry.action === 'order.cancelled' ? 'bg-danger-500'
    : entry.action === 'order.payment_recorded' ? 'bg-success-500'
    : entry.action === 'order.edited' || entry.action === 'order.updated' ? 'bg-info-500'
    : entry.action === 'order.created' ? 'bg-primary' : 'bg-border-strong';

  const when = [formatDate(entry.at) !== formatDate(orderAt) ? formatDate(entry.at) : '', formatTime(entry.at)].filter(Boolean).join(', ');

  return (
    <View className="flex-row gap-3 pb-4">
      <View className={`mt-1.5 size-3 rounded-pill ${tone}`} />
      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-sm font-semibold text-ink">{title}</Text>
          <Text className="text-xs text-muted">{when}</Text>
        </View>
        {!!entry.actor?.name && (
          <Text className="text-xs text-muted">
            {entry.actor.name}{entry.actor.was ? ` (was ${entry.actor.was})` : ''}{entry.actor.email ? ` · ${entry.actor.email}` : ''}{entry.actor.via === 'pos' ? ' · POS terminal' : ''}
          </Text>
        )}
        {(entry.action === 'order.edited' || entry.action === 'order.updated') && (
          <View className="mt-1 gap-2 rounded-control bg-sunken p-3">
            {!entry.changes && <Text className="text-sm text-muted">Change details were not saved for this older order.</Text>}
            {lines.map((line, index) => (
              <View key={index} className="flex-row justify-between gap-2">
                <View className="flex-1">
                  <Text className={`text-sm ${line.now === 0 ? 'text-muted line-through' : line.was === 0 ? 'text-success-700' : 'text-ink'}`}>
                    {line.was === 0 ? `+ ${line.now} × ` : line.now === 0 ? `− ${line.was} × ` : ''}{line.name}
                  </Text>
                  {!!line.detail && <Text className="text-xs text-muted">{line.detail}</Text>}
                </View>
                {line.was > 0 && line.now > 0 && <Text className="text-sm text-body">{line.was} → {line.now}</Text>}
              </View>
            ))}
            {FIELDS.filter((field) => field.key in after).map((field) => (
              <View key={field.key} className="flex-row justify-between gap-3">
                <Text className="text-sm text-muted">{field.label}</Text>
                <Text className="flex-1 text-end text-sm text-ink">
                  {before[field.key] == null || before[field.key] === '' ? 'none' : field.format(before[field.key])} → {after[field.key] == null || after[field.key] === '' ? 'none' : field.format(after[field.key])}
                </Text>
              </View>
            ))}
          </View>
        )}
        {entry.action === 'order.payment_recorded' && after.total != null && (
          <Text className="text-sm text-body">
            {formatRs(Number(after.total))}{Number(after.tax) > 0 ? `, with ${formatRs(Number(after.tax))} tax` : ''}
          </Text>
        )}
        {entry.action === 'order.cancelled' && !!reasons && <Text className="text-sm text-body">{reasons}</Text>}
      </View>
    </View>
  );
}

/** Current and past orders' complete audit timeline, fetched only if the order summary omitted it. */
export default function OrderTimeline({ order }: { order: Order }) {
  const { data, loading, error, get } = useGet<AuditEntry[]>(`/orders/${order._id}/timeline`, {
    active: order.entries !== undefined || Boolean(order.pendingSync),
  });
  const entries = order.entries ?? data ?? [];
  const created = entries.find((entry) => entry.action === 'order.created');

  if (order.pendingSync && order.entries === undefined) {
    return <Text className="text-sm text-muted">This order is waiting to sync. Its server history will be available after it saves.</Text>;
  }
  if (loading && order.entries === undefined) return <SkeletonList rows={4} />;
  if (error && order.entries === undefined) {
    return (
      <View className="gap-3">
        <Text className="text-sm text-danger-700">Could not load this order&apos;s history.</Text>
        <Button variant="outline" onPress={() => get()}>Try again</Button>
      </View>
    );
  }

  return (
    <View className="gap-1">
      <View className="flex-row gap-3 pb-4">
        <View className="mt-1.5 size-3 rounded-pill bg-primary" />
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-ink">Placed</Text>
          <Text className="text-xs text-muted">{formatDate(order.createdAt)}, {formatTime(order.createdAt)}{created?.actor?.name || order.takenBy ? ` · ${created?.actor?.name ?? order.takenBy}` : ''}</Text>
        </View>
      </View>
      {entries.filter((entry) => entry !== created).map((entry) => (
        <TimelineEntry key={entry._id} entry={entry} orderAt={order.createdAt} />
      ))}
    </View>
  );
}
