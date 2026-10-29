import { View } from 'react-native';
import Button from '@/ui/button';
import Select from '@/ui/select';
import dayKey from '@/utils/day_key';
import pastDayOptions from '@/utils/past_day_options';

interface DateRangeBarProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

/** From and To days, up to a year back, and a way back to today. Picking a From after To (or the reverse) moves the other along. */
export default function DateRangeBar({ from, to, onChange }: DateRangeBarProps) {
  const today = dayKey();
  const options = pastDayOptions();

  return (
    <View className="gap-2">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Select label="From" options={options} value={from} onChange={(day) => onChange(day, day > to ? day : to)} />
        </View>
        <View className="flex-1">
          <Select label="To" options={options} value={to} onChange={(day) => onChange(day < from ? day : from, day)} />
        </View>
      </View>
      {(from !== today || to !== today) && (
        <Button variant="secondary" size="sm" className="self-start" onPress={() => onChange(today, today)}>
          Back to today
        </Button>
      )}
    </View>
  );
}
