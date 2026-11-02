import type OrderItem from '@/types/order_item';

const lineKey = (item: OrderItem) => [item.itemId, item.sizeId ?? '', [...(item.addonIds ?? [])].sort().join(','), item.note ?? ''].join('|');

export default function kitchenChanges(before: OrderItem[], after: OrderItem[]): OrderItem[] {
  const count = (items: OrderItem[]) => {
    const lines = new Map<string, { item: OrderItem; qty: number }>();
    for (const item of items) {
      const line = lines.get(lineKey(item));
      if (line) line.qty += item.qty;
      else lines.set(lineKey(item), { item, qty: item.qty });
    }
    return lines;
  };
  const was = count(before);
  const now = count(after);
  const cut: OrderItem[] = [];
  const fresh: OrderItem[] = [];
  for (const [key, { item, qty }] of was) if ((now.get(key)?.qty ?? 0) !== qty) cut.push({ ...item, qty, name: `CANCEL ${item.name}` });
  for (const [key, { item, qty }] of now) if ((was.get(key)?.qty ?? 0) !== qty) fresh.push({ ...item, qty, name: `NEW ${item.name}` });
  return [...cut, ...fresh];
}
