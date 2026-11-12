import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { z } from 'zod';
import FormSheet from '@/components/form_sheet';
import TaxFields from '@/components/tax_fields';
import api from '@/config/api';
import RequirePermission from '@/hoc/require_permission';
import useAuthStore from '@/store/auth_store';
import Button from '@/ui/button';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';
import toast from '@/utils/toast';
import LogoField from './logo_field';

const receiptSchema = z.object({
  restaurantName: z.string().trim().min(1, 'Enter the restaurant name'),
  logo: z.string().nullable().optional(),
  receipt: z.object({
    ntn: z.string().trim().max(30),
    strn: z.string().trim().max(30),
    footer: z.string().trim().max(160),
  }),
});
const percent = z.coerce.number().min(0, 'Cannot be below 0').max(100, 'Cannot be above 100');
const taxSchema = z.object({
  taxByPaymentMethod: z.object({ cash: percent, card: percent, jazzcash: percent, easypaisa: percent, bank: percent }),
});
const templatesSchema = z.object({
  whatsappTemplates: z.object({ winback: z.string().trim(), reservation: z.string().trim() }),
});

/** Restaurant details and taxes use the /me settings, not a second fetch. Saves immediately update the auth store. */
function RestaurantSettings() {
  const workplace = useAuthStore((state) => state.me?.workplace);
  if (!workplace) return null;
  const settings = workplace.settings;
  const receipt = settings.receipt ?? {};

  return (
    <>
      <Stack.Screen options={{ title: 'Restaurant settings' }} />
      <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-5 px-4 pt-4 pb-32">
        <View className="gap-3 rounded-card border border-border bg-surface p-4">
          <Text accessibilityRole="header" className="text-heading font-semibold text-ink">Restaurant details</Text>
          <Text className="text-sm text-body">{workplace.restaurant.name}</Text>
          <Text className="text-sm text-muted">Logo, name, tax numbers and the closing line printed on receipts.</Text>
          <FormSheet title="Edit restaurant" submitLabel="Save restaurant" schema={receiptSchema}
            defaultValues={{
              restaurantName: workplace.restaurant.name, logo: workplace.restaurant.logo ?? null,
              receipt: { ntn: receipt.ntn ?? '', strn: receipt.strn ?? '', footer: receipt.footer ?? '' },
            }}
            onSave={(values) => api.patch('/settings', values).then((res) => {
              useAuthStore.getState().setSettings(res.data);
              toast.success('Restaurant settings saved');
            })}
            fields={(form) => (
              <View className="gap-4">
                <LogoField {...form} />
                <Input label="Restaurant name" required {...form.register('restaurantName')} error={fieldError(form.errors, 'restaurantName')} />
                <Text className="font-semibold text-ink">On receipts (optional)</Text>
                <Input label="NTN" {...form.register('receipt.ntn')} error={fieldError(form.errors, 'receipt.ntn')} />
                <Input label="STRN" {...form.register('receipt.strn')} error={fieldError(form.errors, 'receipt.strn')} />
                <Input label="Closing line" placeholder="Complaints or feedback: 0300 1234567" {...form.register('receipt.footer')} error={fieldError(form.errors, 'receipt.footer')} />
              </View>
            )}
            component={({ open }) => <Button variant="outline" onPress={open}>Edit restaurant details</Button>}
          />
        </View>

        <View className="gap-3 rounded-card border border-border bg-surface p-4">
          <Text accessibilityRole="header" className="text-heading font-semibold text-ink">Tax by payment method</Text>
          <Text className="text-sm text-muted">Applied when an order is paid. Check these rates with your accountant.</Text>
          {Object.entries(settings.taxByPaymentMethod).map(([method, rate]) => (
            <View key={method} className="flex-row justify-between gap-2">
              <Text className="text-sm capitalize text-body">{method}</Text>
              <Text className="text-sm font-medium text-ink">{rate}%</Text>
            </View>
          ))}
          <FormSheet title="Edit tax rates" submitLabel="Save tax" schema={taxSchema}
            defaultValues={{ taxByPaymentMethod: settings.taxByPaymentMethod }}
            onSave={(values) => api.patch('/settings', values).then((res) => {
              useAuthStore.getState().setSettings(res.data);
              toast.success('Tax rates saved');
            })}
            fields={(form) => <TaxFields {...form} />}
            component={({ open }) => <Button variant="outline" onPress={open}>Edit tax rates</Button>}
          />
        </View>

        <View className="gap-3 rounded-card border border-border bg-surface p-4">
          <Text accessibilityRole="header" className="text-heading font-semibold text-ink">WhatsApp templates</Text>
          <Text className="text-sm text-muted">Customer-facing text used for winback offers and reservation messages.</Text>
          <FormSheet title="Edit message templates" submitLabel="Save templates" schema={templatesSchema}
            defaultValues={{ whatsappTemplates: settings.whatsappTemplates }}
            onSave={(values) => api.patch('/settings', values).then((res) => {
              useAuthStore.getState().setSettings(res.data);
              toast.success('WhatsApp templates saved');
            })}
            fields={(form) => (
              <View className="gap-4">
                <Input label="Winback message" multiline {...form.register('whatsappTemplates.winback')} />
                <Input label="Reservation message" multiline {...form.register('whatsappTemplates.reservation')} />
              </View>
            )}
            component={({ open }) => <Button variant="outline" onPress={open}>Edit message templates</Button>}
          />
        </View>
      </ScrollView>
    </>
  );
}

export default function RestaurantSettingsPage() {
  return <RequirePermission permission="settings:manage"><RestaurantSettings /></RequirePermission>;
}
