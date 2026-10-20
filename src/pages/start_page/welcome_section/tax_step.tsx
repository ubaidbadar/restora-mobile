import type RestaurantSettings from '@shared/restaurant_settings';
import { Text } from 'react-native';
import AuthCard from '@/components/auth_card';
import AuthForm from '@/components/auth_form';
import SignedInAs from '@/components/signed_in_as';
import TaxFields from '@/components/tax_fields';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import taxStepSchema from './tax_step_schema';

interface TaxStepProps {
  onSaved: (settings: RestaurantSettings) => void;
}

/** Setup step 2: the tax added to each order, by how the customer pays. */
export default function TaxStep({ onSaved }: TaxStepProps) {
  const taxByPaymentMethod = useAuthStore((state) => state.me!.workplace!.settings.taxByPaymentMethod);
  return (
    <AuthCard title="Set your tax rates" subtitle="Step 2 of 3 · The tax added to each order, picked by how the customer pays." footer={<SignedInAs />}>
      <AuthForm
        schema={taxStepSchema}
        defaultValues={{ taxByPaymentMethod }}
        submitLabel="Continue"
        busyLabel="Saving…"
        onSubmit={({ data, onSuccess, onError }) =>
          api
            .patch('/settings', { taxByPaymentMethod: data.taxByPaymentMethod })
            .then((res) => {
              onSuccess('');
              onSaved(res.data);
            })
            .catch(onError)
        }
        fields={({ register, errors }) => (
          <>
            <TaxFields register={register} errors={errors} />
            <Text className="text-sm text-muted">Not sure? Check these with your accountant; you can change them any time in Settings on the web.</Text>
          </>
        )}
      />
    </AuthCard>
  );
}
