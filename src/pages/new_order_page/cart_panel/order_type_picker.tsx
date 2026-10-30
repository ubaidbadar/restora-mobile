import { View } from 'react-native';
import { useWatch } from 'react-hook-form';
import TableSelect from '@/components/table_select';
import ORDER_TYPE_LABELS from '@/constants/order_type_labels';
import ORDER_TYPES from '@/constants/order_types';
import type FormComponentProps from '@/types/form_component_props';
import type IconName from '@/types/icon_name';
import ChoiceCards from '@/ui/choice_cards';
import DeliveryFields from './delivery_fields';

const ICONS: Record<(typeof ORDER_TYPES)[number], IconName> = { dine_in: 'restaurant-outline', takeaway: 'bag-handle-outline', delivery: 'bicycle-outline' };
const TYPES = ORDER_TYPES.map((value) => ({ value, label: ORDER_TYPE_LABELS[value], icon: ICONS[value] }));

/** Order type, plus the table or the delivery fields it needs. Re-renders only when the type changes. */
export default function OrderTypePicker(props: FormComponentProps) {
  const type = useWatch({ control: props.control, name: 'type' });

  return (
    <View className="gap-3">
      <ChoiceCards {...props.register('type')} label="Order type" options={TYPES} />
      {type === 'dine_in' && <TableSelect register={props.register} errors={props.errors} />}
      {type === 'delivery' && <DeliveryFields {...props} />}
    </View>
  );
}
