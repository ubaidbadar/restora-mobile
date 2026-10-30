import DAY_MS from '@/constants/day_ms';
import dayKey from './day_key';
import formatDay from './format_day';

/** The days numbers and orders can be looked up for: today and the year before, as "Today", "Yesterday", then "Thu, 23 Oct" (PKT). */
const pastDayOptions = () =>
  Array.from({ length: 366 }, (_, index) => {
    const value = dayKey(Date.now() - index * DAY_MS);
    return { value, label: index === 0 ? 'Today' : index === 1 ? 'Yesterday' : formatDay(`${value}T12:00:00+05:00`) };
  });

export default pastDayOptions;
