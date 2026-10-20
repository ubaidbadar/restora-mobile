import { router } from 'expo-router';
import { Text, View } from 'react-native';
import AuthCard from '@/components/auth_card';
import AuthForm from '@/components/auth_form';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';
import createRestaurantSchema from './schema';

/**
 * Setup step 1: the restaurant and its first branch. The server adds the five preset roles and makes you the owner;
 * the answer is the new `/me`, and the setup goes on with tax.
 */
export default function CreateRestaurantPage() {
  return (
    <AuthCard title="Create your restaurant" subtitle="Step 1 of 3 · You'll be its owner. Add more branches and invite your team later.">
      <AuthForm
        schema={createRestaurantSchema}
        defaultValues={{ branchName: 'Main branch' }}
        submitLabel="Create restaurant"
        busyLabel="Creating restaurant…"
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
        fields={({ register, errors }) => (
          <>
            <Input label="Restaurant name" placeholder="e.g. Tandoor House" autoCapitalize="words" required {...register('name')} error={fieldError(errors, 'name')} />
            <View className="gap-4 border-t border-border pt-5">
              <View>
                <Text className="text-base font-semibold text-ink">First branch</Text>
                <Text className="text-sm text-muted">Where orders will be taken.</Text>
              </View>
              <Input label="Branch name" autoCapitalize="words" required {...register('branchName')} error={fieldError(errors, 'branchName')} />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input label="Area" placeholder="e.g. Gulberg III" autoCapitalize="words" {...register('area')} />
                </View>
                <View className="flex-1">
                  <Input label="City" placeholder="e.g. Lahore" autoCapitalize="words" {...register('city')} />
                </View>
              </View>
              <Input label="Branch phone (optional)" keyboardType="phone-pad" autoComplete="tel" {...register('phone')} error={fieldError(errors, 'phone')} />
            </View>
            <Text className="rounded-control bg-primary-soft px-3 py-2.5 text-sm text-body">{"We'll also add five ready roles (Owner, Manager, Cashier, Waiter, Kitchen) that you can edit on the web."}</Text>
          </>
        )}
      />
    </AuthCard>
  );
}
