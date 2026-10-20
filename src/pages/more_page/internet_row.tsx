import useOutboxStore from '@/store/outbox_store';
import MoreRow from './more_row';

/** Connected or offline, as this phone sees it. */
export default function InternetRow() {
  const online = useOutboxStore((state) => state.online);
  return <MoreRow first icon={online ? 'cloud-done-outline' : 'cloud-offline-outline'} label="Internet" value={online ? 'Connected' : 'Offline'} />;
}
