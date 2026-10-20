import DAY_MS from '@/constants/day_ms';
import dayKey from './day_key';
import formatDay from './format_day';

/** The days a booking can be for: today and the next 90, as "Today", "Tomorrow", then "Thu 23 Oct" (PKT). */
const dayOptions = (from = dayKey()) =>
  Array.from({ length: 91 }, (_, index) => {
    const value = dayKey(new Date(`${from}T12:00:00+05:00`).getTime() + index * DAY_MS);
    const name = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : formatDay(`${value}T12:00:00+05:00`);
    return { value, label: name };
  });

export default dayOptions;
