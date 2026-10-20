import { Link } from 'expo-router';
import { View } from 'react-native';
import EmptyState from '@/components/empty_state';
import Button from '@/ui/button';

/** A link that leads nowhere in the app. */
export default function NotFoundPage() {
  return (
    <View className="flex-1 justify-center bg-canvas">
      <EmptyState icon="compass-outline" title="Nothing here" text="This screen doesn't exist. It may have been moved.">
        <Link href="/" replace asChild>
          <Button>Go to the start</Button>
        </Link>
      </EmptyState>
    </View>
  );
}
