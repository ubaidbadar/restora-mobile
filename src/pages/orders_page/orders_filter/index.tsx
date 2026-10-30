import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FormSheet from '@/components/form_sheet';
import ORDER_TYPE_OPTIONS from '@/constants/order_type_options';
import Icon from '@/ui/icon';
import Tabs from '@/ui/tabs';
import dayKey from '@/utils/day_key';
import dayPresets from '@/utils/day_presets';
import filterSchema from './filter_schema';
import PickDays from './pick_days';

const VIEWS = [
  { value: 'board', label: 'Board' },
  { value: 'list', label: 'List' },
];

/**
 * The one Filter button beside the search, with a count of what differs from the start (today, all types, the board).
 * It opens a sheet with the days, the order type and the board or a list, applied together (the web's filter drawer).
 */
export default function OrdersFilter() {
  const today = dayKey();
  const presets = dayPresets();
  const { from = today, to = today, type = 'all', view = 'board' } = useLocalSearchParams<{ from?: string; to?: string; type?: string; view?: string }>();
  const days = presets.find((preset) => preset.from === from && preset.to === to)?.value ?? 'pick';
  const count = Number(from !== today || to !== today) + Number(type !== 'all') + Number(view !== 'board');
  const dayOptions = [...presets.map(({ value, label }) => ({ value, label })), { value: 'pick', label: 'Pick days' }];

  return (
    <FormSheet
      title="Filter orders"
      schema={filterSchema}
      defaultValues={{ days, from, to, type, view }}
      submitLabel="Show orders"
      onSave={(values) => {
        const preset = presets.find((preset) => preset.value === values.days);
        // Picking a From after To (or the reverse) swaps them.
        const [start, end] = preset ? [preset.from, preset.to] : [values.from, values.to].sort();
        // Today is left out of the route, so the board stays the live one. The status is left out too: today's board
        // and other days' list read it differently.
        router.setParams({
          from: start === today ? undefined : start,
          to: end === today ? undefined : end,
          type: values.type === 'all' ? undefined : values.type,
          view: values.view === 'board' ? undefined : values.view,
          status: undefined,
        });
      }}
      fields={(form) => (
        <>
          <View className="gap-2">
            <Text className="text-sm font-semibold text-ink">Days</Text>
            <Tabs {...form.register('days')} options={dayOptions} wrap />
          </View>
          <PickDays {...form} />
          <View className="gap-2">
            <Text className="text-sm font-semibold text-ink">Order type</Text>
            <Tabs {...form.register('type')} options={ORDER_TYPE_OPTIONS} wrap />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-semibold text-ink">Show today&apos;s orders as</Text>
            <Tabs {...form.register('view')} options={VIEWS} />
          </View>
        </>
      )}
      component={({ open }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={count ? `Filter, ${count} set` : 'Filter'}
          onPress={open}
          className="min-h-11 flex-row items-center gap-2 rounded-control border border-border-strong bg-surface px-3 active:bg-sunken"
        >
          <Icon name="options-outline" size={18} className="accent-ink" />
          <Text className="text-sm font-semibold text-ink">Filter</Text>
          {count > 0 && <Text className="min-w-5 rounded-pill bg-primary px-1.5 text-center text-xs font-semibold text-on-primary">{count}</Text>}
        </Pressable>
      )}
    />
  );
}
