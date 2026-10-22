import { fetch } from 'expo/fetch';
import authClient from '@/config/auth_api';
import API_URL from '@/constants/api_url';
import type GuestCall from '@/types/guest_call';
import type Order from '@/types/order';

/**
 * Calls `onOrder` with each order placed or changed on any device, from the server's live stream (GET /orders/stream,
 * Server-Sent Events), `onCall` with each guest's call from a table's QR page (made or answered), and `onReconnect` each
 * time the stream opens again after a break: the server ends it every few minutes, and the phone loses it without
 * internet or in the background. React Native has no EventSource, so the stream is read with Expo's fetch. Answers a
 * function that stops listening.
 */
export default function listenOrders(
  onOrder: (order: Order, created: boolean) => void,
  onCall: (call: GuestCall, created: boolean) => void,
  onReconnect: () => void
) {
  const controller = new AbortController();

  const listen = async (again: boolean) => {
    const cookie = await authClient.getCookie();
    const res = await fetch(`${API_URL}/api/v1/orders/stream`, { headers: cookie ? { Cookie: cookie } : {}, signal: controller.signal });
    // Signed out or not allowed: the api interceptor and the guards deal with that, so stop here.
    if (res.status === 401 || res.status === 403) return controller.abort();
    if (!res.ok || !res.body) return;
    if (again) onReconnect();

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      // Events end with a blank line; the last piece may be half an event, kept for the next chunk.
      const events = (buffer + value).split('\n\n');
      buffer = events.pop() ?? '';
      for (const event of events) {
        const name = event.match(/^event: (.*)$/m)?.[1] ?? '';
        const data = event.match(/^data: (.*)$/m)?.[1];
        if (!data) continue;
        if (name.startsWith('order.')) onOrder(JSON.parse(data) as Order, name === 'order.created');
        if (name.startsWith('call.')) onCall(JSON.parse(data) as GuestCall, name === 'call.created');
      }
    }
  };

  void (async () => {
    let again = false;
    while (!controller.signal.aborted) {
      await listen(again).catch(() => undefined);
      again = true;
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
  })();

  return () => controller.abort();
}
