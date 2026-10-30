import { useEffect } from 'react';
import { router } from 'expo-router';
import api from '@/config/api';
import getCache from '@/store/get_cache';
import type FloorTable from '@/types/floor_table';
import type Order from '@/types/order';
import dayKey from '@/utils/day_key';
import listenOrders from '@/utils/listen_orders';
import toast from '@/utils/toast';
import upsertById from '@/utils/upsert_by_id';

/** Still going on at its table: not cancelled, and not both done and paid. */
const isOpen = (order: Order) => order.status !== 'cancelled' && !(order.status === 'completed' && order.paymentStatus === 'paid');

/**
 * The server's live stream, open on every tab: orders placed or changed on any device, and guests' calls from the
 * table QR page. Each event updates the saved answers of `/orders` and `/tables/floor`, so the board and the Tables tab
 * change on their own. A guest's new order or call buzzes and shows a toast.
 */
export default function LiveUpdates() {
  useEffect(() => {
    const ordersKey = getCache.keyOf('/orders');
    const floorKey = getCache.keyOf('/tables/floor');

    return listenOrders(
      (order, created) => {
        // Only today's orders belong on the board; a change to an older one (e.g. paid from a customer's page) does not.
        if (order.dayKey !== dayKey()) return;
        getCache.update<Order[]>(ordersKey, (list) => (list ? upsertById(list, order) : list));
        if (order.tableId) {
          const row = { _id: order._id, dailyToken: Number(order.dailyToken), total: order.total, status: order.status, paymentStatus: order.paymentStatus, createdAt: order.createdAt };
          getCache.update<FloorTable[]>(floorKey, (tables) =>
            tables?.map((table) => (table._id !== order.tableId ? table : { ...table, orders: isOpen(order) ? upsertById(table.orders, row) : table.orders.filter((item) => item._id !== order._id) }))
          );
        }
        if (created && order.status === 'pending') toast.warning(`Table ${order.tableName} sent order #${order.dailyToken}`, { label: 'Open', onClick: () => router.navigate('/') });
      },
      (call, created) => {
        const request = { _id: call._id, type: call.type, createdAt: call.createdAt };
        getCache.update<FloorTable[]>(floorKey, (tables) =>
          tables?.map((table) => ({ ...table, requests: call.resolved ? table.requests.filter((item) => item._id !== call._id) : table._id === call.tableId ? upsertById(table.requests, request) : table.requests }))
        );
        if (created) toast.warning(`Table ${call.tableName ?? ''} ${call.type === 'bill' ? 'asks for the bill' : 'calls a waiter'}`, { label: 'Tables', onClick: () => router.navigate('/tables') });
      },
      // After a break in the stream, load again what came in between: once today's board is here, only the orders
      // changed since its latest change (10 s before, for writes saved late).
      () => {
        const board = getCache.get(ordersKey) as Order[] | undefined;
        const latest = board?.every((order) => order.dayKey === dayKey()) ? board.reduce((max, order) => (order.updatedAt && order.updatedAt > max ? order.updatedAt : max), '') : '';
        if (latest) {
          const since = new Date(Date.parse(latest) - 10_000).toISOString();
          api.get<Order[]>('/orders', { params: { since } }).then((res) => getCache.update<Order[]>(ordersKey, (list) => res.data.reduce(upsertById, list ?? [])), () => {});
        } else {
          api.get('/orders').then((res) => getCache.set(ordersKey, res.data), () => {});
        }
        if (getCache.get(floorKey)) api.get('/tables/floor').then((res) => getCache.set(floorKey, res.data), () => {});
      }
    );
  }, []);

  return null;
}
