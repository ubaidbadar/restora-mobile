import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import AUTH_HIGHLIGHTS from '@/constants/auth_highlights';
import AuthArt from '@/icons/auth_art';
import Button from '@/ui/button';

/**
 * The first screen when nobody is signed in: what Restora is, then the two ways in. Owners create their restaurant;
 * staff who were invited sign in (or create an account) with the email the invitation went to.
 *
 * It fits any phone without scrolling: the words and buttons keep their size, and the drawing takes the height left.
 */
export default function WelcomePage() {
  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={{ flex: 1 }}>
        <View className="w-full max-w-md flex-1 gap-5 self-center px-6 pt-2 pb-4">
          <View className="flex-row items-center gap-2.5">
            <Image source={require('@/assets/brand/symbol.png')} style={{ width: 32, height: 32 }} accessibilityIgnoresInvertColors />
            <Text className="text-xl font-bold text-ink">Restora</Text>
          </View>
          <View className="min-h-0 -top-4 flex-1 items-center justify-center">
            <AuthArt />
          </View>
          <View className="gap-3 -top-10">
            <Text accessibilityRole="header" className="text-display font-bold text-ink">
              Every order, every guest, one place.
            </Text>
            <Text className="text-base text-body">{"Take orders, serve tables and keep khata from your phone. It keeps working when the internet doesn't."}</Text>
            <View className="flex-row flex-wrap gap-2">
              {AUTH_HIGHLIGHTS.map((highlight) => (
                <Text key={highlight} className="rounded-small bg-sunken px-2.5 py-1 text-sm font-medium text-body">
                  {highlight}
                </Text>
              ))}
            </View>
          </View>
          <View className="mt-auto gap-3">
            <Link href="/sign_up" asChild>
              <Button size="lg" icon="storefront-outline">
                Create your restaurant
              </Button>
            </Link>
            <Link href="/sign_in" asChild>
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
            <Text className="text-center text-sm text-muted">Invited by your restaurant? Use the email the invitation was sent to.</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
