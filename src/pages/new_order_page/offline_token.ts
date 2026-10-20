import dayKey from '@/utils/day_key';
import offlineDb from '@/utils/offline_db';

/** This device's letter and today's count, loaded from the device when the app starts. */
const saved: { letter?: string; day?: string; count: number } = { count: 0 };
void offlineDb.get<typeof saved>('offline-token').then((value) => value && Object.assign(saved, value));

/**
 * The number an order taken offline shows until the server gives it a token: this device's letter and a count for the
 * day, e.g. "A-3". Each device keeps its own letter, so two offline phones never show the same number.
 */
export default function offlineToken() {
  saved.letter ??= String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const today = dayKey();
  saved.count = saved.day === today ? saved.count + 1 : 1;
  saved.day = today;
  void offlineDb.set('offline-token', saved);
  return `${saved.letter}-${saved.count}`;
}
