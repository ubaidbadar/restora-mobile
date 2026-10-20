import { Text, View } from 'react-native';
import DAY_MS from '@/constants/day_ms';
import Button from '@/ui/button';
import IconButton from '@/ui/icon_button';
import dayKey from '@/utils/day_key';
import formatDay from '@/utils/format_day';

interface DayBarProps {
  day: string;
  onDay: (day: string) => void;
  /** "3 bookings, 12 guests". */
  summary: string;
}

const addDays = (day: string, count: number) => dayKey(new Date(`${day}T12:00:00+05:00`).getTime() + count * DAY_MS);

/** The day shown: previous and next, back to today, and how busy it is. */
export default function DayBar({ day, onDay, summary }: DayBarProps) {
  const today = dayKey();
  const name = day === today ? 'Today' : day === addDays(today, 1) ? 'Tomorrow' : formatDay(`${day}T12:00:00+05:00`);

  return (
    <View className="flex-row items-center gap-2">
      <IconButton icon="chevron-back" variant="outline" label="Previous day" onPress={() => onDay(addDays(day, -1))} />
      <View className="flex-1 items-center">
        <Text className="text-base font-semibold text-ink">{name}</Text>
        <Text className="text-sm text-muted">{summary}</Text>
      </View>
      <IconButton icon="chevron-forward" variant="outline" label="Next day" onPress={() => onDay(addDays(day, 1))} />
      {day !== today && (
        <Button variant="secondary" size="sm" onPress={() => onDay(today)}>
          Today
        </Button>
      )}
    </View>
  );
}
