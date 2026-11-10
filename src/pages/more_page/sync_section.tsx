import useOutboxStore from '@/store/outbox_store';
import Button from '@/ui/button';
import syncOutbox from '@/utils/sync_outbox';
import belongsToCurrentWorkplace from '@/utils/belongs_to_current_workplace';
import InternetRow from './internet_row';
import MoreRow from './more_row';

/** Online or not, and changes made offline still waiting on this phone. */
export default function SyncSection() {
  const items = useOutboxStore((state) => state.items);
  const pending = items.filter(belongsToCurrentWorkplace);
  const waiting = pending.length;
  const issue = pending.find((item) => item.syncIssue);

  return (
    <>
      <InternetRow />
      {issue && <MoreRow icon="warning-outline" label="Needs review" value={issue.syncIssue} />}
      <MoreRow
        icon="hourglass-outline"
        label="Waiting to send"
        value={waiting ? undefined : 'Nothing'}
        trailing={
          waiting && !issue ? (
            <Button size="sm" variant="secondary" onPress={() => void syncOutbox()}>
              {`Send ${waiting} now`}
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
