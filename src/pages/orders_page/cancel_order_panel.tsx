import { Text, View } from 'react-native';
import Chips from '@/ui/chips';
import CANCEL_REASON_LABELS from '@/constants/cancel_reason_labels';
import type Order from '@/types/order';
import type OrderCancellation from '@/types/order_cancellation';
import type OverlayProps from '@/types/overlay_props';
import Button from '@/ui/button';
import Form from '@/ui/form';
import Input from '@/ui/input';
import SheetPanel from '@/ui/sheet_panel';
import fieldError from '@/utils/field_error';
import cancelSchema from './cancel_schema';

interface CancelOrderPanelProps extends OverlayProps {
  order: Order;
  /** Sends the cancel with its reason; the server adds who and when. */
  onCancel: (body: Pick<OrderCancellation, 'reason' | 'note'>) => void;
}

const REASONS = Object.entries(CANCEL_REASON_LABELS).map(([value, label]) => ({ value, label }));

/** Asks why before cancelling an order (or turning down a guest's), so the Cancelled tab says what happened. */
export default function CancelOrderPanel({ order, onCancel, ...overlay }: CancelOrderPanelProps) {
  const fromTable = order.status === 'pending';

  return (
    <SheetPanel {...overlay} title={fromTable ? `Turn down order #${order.dailyToken}?` : `Cancel order #${order.dailyToken}?`}>
      <Form
        schema={cancelSchema}
        className="gap-4"
        onSubmit={({ data }) => {
          overlay.close();
          onCancel({ reason: data.reason, note: data.note || undefined });
        }}
        component={({ register, errors, onSubmit }) => (
          <>
            <Text className="text-base text-body">
              {fromTable
                ? 'The guest’s order moves to Cancelled. Let them know at the table.'
                : "It moves to Cancelled and is not counted in sales. Its customer's khata and totals are corrected."}
            </Text>
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Why?</Text>
              <Chips {...register('reason')} options={REASONS} wrap />
              {fieldError(errors, 'reason') && (
                <Text accessibilityRole="alert" className="text-sm font-medium text-danger-700">
                  {fieldError(errors, 'reason')}
                </Text>
              )}
            </View>
            <Input label="Note" multiline maxLength={200} placeholder="Anything the team should know" {...register('note')} error={fieldError(errors, 'note')} />
            <Button variant="destructive" size="lg" onPress={onSubmit}>
              {fromTable ? 'Turn down' : 'Cancel order'}
            </Button>
          </>
        )}
      />
    </SheetPanel>
  );
}
