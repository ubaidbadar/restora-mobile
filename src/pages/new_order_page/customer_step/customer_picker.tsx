import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import CustomerFields from '@/components/customer_fields';
import customerSchema from '@/constants/customer_schema';
import type Customer from '@/types/customer';
import type OverlayProps from '@/types/overlay_props';
import Button from '@/ui/button';
import Form from '@/ui/form';
import SearchField from '@/ui/search_field';
import SheetPanel from '@/ui/sheet_panel';
import CustomerMatches from './customer_matches';
import saveNewCustomer from './save_new_customer';

interface CustomerPickerProps extends OverlayProps {
  onPick: (customer: Customer, offline?: boolean) => void;
}

/** Find the customer by number or name; or add a new one, as a second step of the same sheet. */
export default function CustomerPicker({ onPick, ...tools }: CustomerPickerProps) {
  const [view, setView] = useState<{ search: string; adding?: { name: string; phone: string } }>({ search: '' });
  const pick = (customer: Customer, offline?: boolean) => {
    onPick(customer, offline);
    tools.close();
  };

  return (
    <SheetPanel {...tools} full noScroll title={view.adding ? 'New customer' : 'Customer'} onBack={view.adding ? () => setView({ search: view.search }) : undefined}>
      {view.adding ? (
        <Form
          className="flex-1"
          schema={customerSchema}
          defaultValues={view.adding}
          onSubmit={({ data }) => saveNewCustomer(data, pick)}
          component={(form) => (
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 px-5 pb-10">
              <CustomerFields {...form} quick />
              {form.error && (
                <Text accessibilityRole="alert" className="rounded-control bg-danger-50 px-3 py-2.5 text-sm font-medium text-danger-700">
                  {form.error}
                </Text>
              )}
              <Button size="lg" disabled={form.loading} onPress={form.onSubmit}>
                {form.loading ? 'Saving…' : 'Save and pick'}
              </Button>
            </ScrollView>
          )}
        />
      ) : (
        <>
          <View className="px-5 pb-2">
            <SearchField
              autoFocus
              accessibilityLabel="Find customer by phone number or name"
              placeholder="Phone number or name"
              value={view.search}
              onChangeText={(search) => setView({ search })}
            />
          </View>
          <CustomerMatches term={view.search.trim()} onPick={pick} onNew={(adding) => setView({ search: view.search, adding })} />
        </>
      )}
    </SheetPanel>
  );
}
