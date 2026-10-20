import { Text } from 'react-native';
import useAuthStore from '@/store/auth_store';
import Button from '@/ui/button';
import signOut from '@/utils/sign_out';

/** "Signed in as …  Sign out", under the start screens. */
export default function SignedInAs() {
  const email = useAuthStore((state) => state.me?.user.email);
  return (
    <>
      <Text className="text-sm text-muted">Signed in as {email}.</Text>
      <Button variant="primaryLink" size="sm" onPress={() => void signOut()}>
        Sign out
      </Button>
    </>
  );
}
