import { File, Paths } from 'expo-file-system';

const fileOf = (key: string) => new File(Paths.document, `restora-${key}.json`);

/**
 * A small key-value store on this device, for what must survive closing the app or losing internet: the last `/me`,
 * the answers `useGet` has seen, the outbox of changes waiting to be sent, the chosen appearance. Every call resolves,
 * never rejects: when storage fails, the app simply works online only.
 */
const offlineDb = {
  get: <T>(key: string): Promise<T | undefined> => {
    const file = fileOf(key);
    if (!file.exists) return Promise.resolve(undefined);
    return file
      .text()
      .then((text) => JSON.parse(text) as T)
      .catch(() => undefined);
  },
  set: (key: string, value: unknown): Promise<void> => fileOf(key).write(JSON.stringify(value ?? null)).catch(() => undefined),
};

export default offlineDb;
