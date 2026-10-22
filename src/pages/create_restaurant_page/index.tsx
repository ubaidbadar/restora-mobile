import { router, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import Button from '@/ui/button';
import Form from '@/ui/form';
import IconButton from '@/ui/icon_button';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';
import createRestaurantSchema from './schema';

/**
 * Setup step 1: the restaurant and its first branch. The server adds the five preset roles and makes you the owner;
 * the answer is the new `/me`, and the setup goes on with tax.
 */
export default function CreateRestaurantPage() {
  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          bottomOffset={24}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
        >
          <Form
            schema={createRestaurantSchema}
            defaultValues={{ branchName: 'Main branch' }}
            className="w-full max-w-md flex-1 self-center"
            onSubmit={({ data, onSuccess, onError }) =>
              api
                .post('/onboarding', data)
                .then((res) => {
                  onSuccess('');
                  useAuthStore.getState().setMe(res.data.me);
                  router.back();
                })
                .catch(onError)
            }
            component={(form) => (
              <>
                <Stack.Screen
                  options={{
                    headerTitleAlign: 'center',
                    headerTitle: () => (
                      <Image
                        source={require('@/assets/brand/symbol.png')}
                        style={{ width: 32, height: 32 }}
                        contentFit="contain"
                        accessibilityIgnoresInvertColors
                      />
                    ),
                    headerLeft: () => (
                      <IconButton
                        icon="chevron-back"
                        label="Back"
                        className="-ms-2"
                        onPress={() => router.back()}
                      />
                    ),
                    headerRight: () => (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={form.loading}
                        onPress={form.onSubmit}
                      >
                        {form.loading ? 'Saving…' : 'Save'}
                      </Button>
                    ),
                  }}
                />

                <View className="flex-1 gap-6">
                  <View className="gap-1.5">
                    <Text accessibilityRole="header" className="text-display font-bold text-ink">
                      Create your restaurant
                    </Text>
                    <Text className="text-base text-muted">
                      {"Step 1 of 3 · You'll be its owner. Add more branches and invite your team later."}
                    </Text>
                  </View>

                  {form.error && (
                    <Text accessibilityRole="alert" className="rounded-control bg-danger-50 px-3 py-2.5 text-sm font-medium text-danger-700">
                      {form.error}
                    </Text>
                  )}

                  <View className="gap-4">
                    <Input label="Restaurant name" placeholder="e.g. Tandoor House" autoCapitalize="words" required {...form.register('name')} error={fieldError(form.errors, 'name')} />
                    <View className="gap-4 border-t border-border pt-5">
                      <View>
                        <Text className="text-base font-semibold text-ink">First branch</Text>
                        <Text className="text-sm text-muted">Where orders will be taken.</Text>
                      </View>
                      <Input label="Branch name" autoCapitalize="words" required {...form.register('branchName')} error={fieldError(form.errors, 'branchName')} />
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <Input label="Area" placeholder="e.g. Gulberg III" autoCapitalize="words" {...form.register('area')} />
                        </View>
                        <View className="flex-1">
                          <Input label="City" placeholder="e.g. Lahore" autoCapitalize="words" {...form.register('city')} />
                        </View>
                      </View>
                      <Input label="Branch phone (optional)" keyboardType="phone-pad" autoComplete="tel" {...form.register('phone')} error={fieldError(form.errors, 'phone')} />
                    </View>
                  </View>
                </View>
              </>
            )}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}
