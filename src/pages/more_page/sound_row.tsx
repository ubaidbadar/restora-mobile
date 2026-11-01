import { Switch } from 'react-native';
import useOrderAlertStore from '@/store/order_alert_store';
import MoreRow from './more_row';

/** Whether this phone chimes for new orders and guests' calls while the app is open. It buzzes either way. */
export default function SoundRow() {
  const muted = useOrderAlertStore((state) => state.muted);
  return (
    <MoreRow
      first
      icon={muted ? 'volume-mute-outline' : 'volume-high-outline'}
      label="Chime for new orders"
      trailing={
        <Switch
          accessibilityLabel="Chime for new orders"
          value={!muted}
          onValueChange={(on) => useOrderAlertStore.getState().setMuted(!on)}
          trackColorOnClassName="accent-primary"
          trackColorOffClassName="accent-border-strong"
          thumbColorClassName="accent-surface"
        />
      }
    />
  );
}
