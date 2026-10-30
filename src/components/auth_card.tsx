import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** A line under the form, e.g. the link to the other screen. */
  footer?: ReactNode;
  /** Safe area edges to pad (defaults to all four; the sides only matter in landscape, round the notch). */
  edges?: readonly ('top' | 'right' | 'bottom' | 'left')[];
  /** Whether to hide the Restora symbol and wordmark in the card. */
  hideBrand?: boolean;
}

/**
 * The screens before the app: sign in, create account, check email, forgot password, the first restaurant. The column
 * fills the screen, so a form's button sits at the bottom (above the keyboard while typing) on every phone.
 */
export default function AuthCard({ title, subtitle, children, footer, edges = ['top', 'bottom', 'left', 'right'], hideBrand = false }: AuthCardProps) {
  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          bottomOffset={24}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}
        >
          <View className="w-full max-w-md flex-1 gap-7 self-center">
            {!hideBrand && (
              <View className="flex-row items-center gap-2.5">
                <Image source={require('@/assets/brand/symbol.png')} style={{ width: 36, height: 36 }} accessibilityIgnoresInvertColors />
                <Text className="text-xl font-bold text-ink">Restora</Text>
              </View>
            )}
            <View className="gap-1.5">
              <Text accessibilityRole="header" className="text-display font-bold text-ink">
                {title}
              </Text>
              <Text className="text-base text-muted">{subtitle}</Text>
            </View>
            {children}
            {footer && <View className="flex-row flex-wrap items-center justify-center gap-1">{footer}</View>}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}
