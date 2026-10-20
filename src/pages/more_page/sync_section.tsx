import useOutboxStore from '@/store/outbox_store';
import Button from '@/ui/button';
import syncOutbox from '@/utils/sync_outbox';
import InternetRow from './internet_row';
import MoreRow from './more_row';

/** Online or not, and changes made offline still waiting on this phone. */
export default function SyncSection() {
  const waiting = useOutboxStore((state) => state.items.length);

  return (
    <>
      <InternetRow />
      <MoreRow
        icon="hourglass-outline"
        label="Waiting to send"
        value={waiting ? undefined : 'Nothing'}
        trailing={
          waiting ? (
            <Button size="sm" variant="secondary" onPress={() => void syncOutbox()}>
              {`Send ${waiting} now`}
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
