import { Text, View } from 'react-native';
import useAuthStore from '@/store/auth_store';
import Avatar from '@/ui/avatar';
import initialsOf from '@/utils/initials_of';

/** Who is signed in, and their roles here. */
export default function AccountCard() {
  const me = useAuthStore((state) => state.me);
  if (!me) return null;

  return (
    <View className="flex-row items-center gap-4 rounded-card border border-border bg-surface p-4">
      <Avatar initials={initialsOf(me.user.name)} image={me.user.image} size="lg" />
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-lg font-bold text-ink">
          {me.user.name}
        </Text>
        <Text numberOfLines={1} className="text-sm text-muted">
          {me.user.email}
        </Text>
        {me.workplace && (
          <Text numberOfLines={1} className="text-sm font-medium text-accent-text">
            {me.workplace.roleNames.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
}
