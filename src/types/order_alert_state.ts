export default interface OrderAlertState {
  /** Ids of new orders announced on this phone that nobody has opened or moved on yet. */
  fresh: string[];
  /** This phone does not chime for new orders and guests' calls (it still buzzes). */
  muted: boolean;
  add: (id: string) => void;
  seen: (id: string) => void;
  setMuted: (muted: boolean) => void;
}
