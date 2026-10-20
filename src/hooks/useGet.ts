import { useEffect, useState } from 'react';
import type { AxiosRequestConfig } from 'axios';
import api from '@/config/api';
import getCache from '@/store/get_cache';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';

type UseGetOptions = AxiosRequestConfig & {
  /** `true` holds the request, e.g. a search under 3 characters. */
  active?: boolean;
};

type GetState<T> = {
  /** Nothing to show yet: the first load, without an answer saved on the device. */
  loading: boolean;
  /** A request is on its way (also when a saved answer is shown meanwhile): the pull-to-refresh spinner. */
  refreshing?: boolean;
  data?: T;
  error?: string;
};

type Request = {
  id: number;
  options: AxiosRequestConfig;
  /** Show the answer saved on the device without asking the server again (switching back to a filter seen before). */
  reuse?: boolean;
};

// Requests on their way, so two screens asking for the same thing at once make one request.
const pending = new Map<string, Promise<unknown>>();

/** The only way to read from the API (same as the web app's `useGet`). Loads once on mount; `get()` loads again. */
export default function useGet<T = unknown>(url: string, { active, ...initialOptions }: UseGetOptions = {}) {
  const [state, setState] = useState<GetState<T>>(() => {
    const data = getCache.get(getCache.keyOf(url, initialOptions)) as T | undefined;
    return { loading: !active && data === undefined, data };
  });
  const [request, setRequest] = useState<Request>({ id: 0, options: initialOptions });

  // Merges `params` too, so `get({ params: { date } })` keeps the other params. `{ reuse: true }`: a switch between
  // filters, answered from the device when this exact request was answered before (pull to refresh asks again).
  const get = (override: AxiosRequestConfig = {}, { reuse = false }: { reuse?: boolean } = {}) =>
    setRequest((r) => ({
      id: r.id + 1,
      reuse,
      options: { ...r.options, ...override, params: override.params ? { ...r.options.params, ...override.params } : r.options.params },
    }));

  useEffect(() => {
    if (!active) setRequest((r) => ({ ...r, id: r.id + 1 }));
  }, [active]);

  useEffect(() => {
    if (request.id === 0) return;
    let current = true;
    const key = getCache.keyOf(url, request.options);
    const cached = getCache.get(key) as T | undefined;
    // Shows changes made to this answer elsewhere (another screen's update, an order synced from the outbox).
    const unsubscribe = getCache.subscribe((changed) => changed === key && current && setState((s) => ({ ...s, data: getCache.get(key) as T })));
    if (request.reuse && cached !== undefined) {
      setState({ loading: false, refreshing: false, data: cached });
      return () => {
        current = false;
        unsubscribe();
      };
    }
    setState((s) => ({ ...s, data: cached ?? s.data, loading: cached === undefined, refreshing: true, error: undefined }));

    let promise = pending.get(key);
    if (!promise) {
      promise = api<T>({ method: 'GET', url, ...request.options }).then((res) => res.data);
      pending.set(key, promise);
      // Saved and reported once, however many screens are waiting for it. Without internet, a screen that has a saved
      // answer just keeps showing it: no error on every screen while offline.
      promise
        .then(
          (data) => getCache.set(key, data),
          (err) => (err.response || cached === undefined) && toast.error(getAxiosMessage(err))
        )
        .finally(() => pending.delete(key));
    }

    promise
      .then((data) => current && setState((s) => ({ ...s, loading: false, refreshing: false, data: data as T })))
      .catch((err) => current && setState((s) => ({ ...s, loading: false, refreshing: false, error: getAxiosMessage(err) })));

    return () => {
      current = false;
      unsubscribe();
    };
  }, [url, request]);

  // Changes the cached answer; every screen showing it (this one too) updates, and the next visit shows the change.
  const update = (updater: (currentData: T | undefined) => T | undefined) => getCache.update(getCache.keyOf(url, request.options), updater);

  return { ...state, options: request.options, get, update };
}
