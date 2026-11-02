/** One dish whose count changed in an edit: 0 → 2 was added, 2 → 0 was removed. */
export default interface LineChange {
  name: string;
  detail?: string;
  was: number;
  now: number;
}
