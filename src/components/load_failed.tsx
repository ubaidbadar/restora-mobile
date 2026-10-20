import Button from '@/ui/button';
import EmptyState from './empty_state';

interface LoadFailedProps {
  /** What did not load, e.g. "the menu". */
  what: string;
  onRetry: () => void;
}

/** Shown in place of a list that could not load and has nothing saved on the device. */
export default function LoadFailed({ what, onRetry }: LoadFailedProps) {
  return (
    <EmptyState icon="cloud-offline-outline" title={`Couldn't load ${what}`} text="Check the internet connection and try again.">
      <Button icon="refresh" variant="outline" onPress={onRetry}>
        Try again
      </Button>
    </EmptyState>
  );
}
