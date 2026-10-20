import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Icon from '@/ui/icon';
import type IconName from '@/types/icon_name';
import formatTime from '@/utils/format_time';
import minutesSince from '@/utils/minutes_since';

const LATE_AFTER = 20;
const VERY_LATE_AFTER = 40;
/** Past this, the wait is no longer a live count: the order was most likely left open, so it says since when, calmly. */
const STALE_AFTER = 180;

const LEVELS: Record<'ok' | 'late' | 'veryLate' | 'stale', { icon: IconName; label: string; box: string; text: string; color: string }> = {
  ok: { icon: 'time-outline', label: 'Waiting', box: 'bg-sunken', text: 'text-body', color: 'accent-body' },
  late: { icon: 'warning-outline', label: 'Late', box: 'bg-warning-50', text: 'text-warning-800', color: 'accent-warning-800' },
  veryLate: { icon: 'flame-outline', label: 'Very late', box: 'bg-danger-50', text: 'text-danger-700', color: 'accent-danger-700' },
  stale: { icon: 'time-outline', label: 'Open', box: 'bg-sunken', text: 'text-muted', color: 'accent-muted' },
};

/**
 * How long the order has been waiting, counting up while the board is open (`12m`, `1h 5m`); after three hours, since
 * when (`Since 8:51am`), without alarm colors, so the orders that are late right now stand out. Lateness is shown by the icon and the
 * label read out to screen readers, not by color alone.
 */
export default function ElapsedChip({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const minutes = minutesSince(since, now);
  const level = LEVELS[minutes >= STALE_AFTER ? 'stale' : minutes >= VERY_LATE_AFTER ? 'veryLate' : minutes >= LATE_AFTER ? 'late' : 'ok'];
  const text = minutes >= STALE_AFTER ? `Since ${formatTime(since)}` : minutes < 60 ? `${Math.max(0, minutes)}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

  return (
    <View accessibilityLabel={`${level.label}: ${text}`} className={`flex-row items-center gap-1 rounded-small px-1.5 py-0.5 ${level.box}`}>
      <Icon name={level.icon} size={14} className={level.color} />
      <Text className={`text-xs font-semibold ${level.text}`}>{text}</Text>
    </View>
  );
}
