import can from '@shared/can';
import { router } from 'expo-router';
import CustomerFields from '@/components/customer_fields';
import FormSheet from '@/components/form_sheet';
import api from '@/config/api';
import customerSchema from '@/constants/customer_schema';
import useAuthStore from '@/store/auth_store';
import type Customer from '@/types/customer';
import ActionMenu from '@/ui/action_menu';
import confirm from '@/utils/confirm';
import formatPhone from '@/utils/format_phone';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import MergeCustomer from './merge_customer';

interface CustomerActionsProps {
  customer: Customer;
  onCustomer: (customer: Customer) => void;
}

/** The ⋯ in the header: edit the customer, or delete a record saved by mistake (only one without orders). */
export default function CustomerActions({ customer, onCustomer }: CustomerActionsProps) {
  const workplace = useAuthStore((state) => state.me?.workplace);
  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${customer.name}?`,
      message: customer.orderCount ? 'This customer has orders, so they can only be merged into another record, not deleted.' : 'Only for a record saved by mistake. This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    api
      .delete(`/customers/${customer._id}`)
      .then(() => {
        toast.success(`${customer.name} deleted`);
        router.back();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };
  // The saved customer as the text the inputs show.
  const editValues = {
    ...customer,
    phone: formatPhone(customer.phone),
    altPhone: customer.altPhone ? formatPhone(customer.altPhone) : '',
    tags: customer.tags.join(', '),
    addresses: (customer.addresses ?? []).join('\n'),
  };

  return (
    <FormSheet
      title="Edit customer"
      schema={customerSchema}
      defaultValues={editValues}
      onSave={(values) =>
        api.patch<Customer>(`/customers/${customer._id}`, values).then((res) => {
          onCustomer(res.data);
          toast.success('Customer saved');
        })
      }
      fields={(form) => <CustomerFields {...form} />}
      component={({ open: edit }) => (
        <MergeCustomer
          customer={customer}
          onMerged={onCustomer}
          component={({ open: merge }) => (
        <ActionMenu
          label={`More for ${customer.name}`}
          title={customer.name}
          items={[
            { label: 'Edit customer', icon: 'create-outline', symbol: 'square.and.pencil', onPress: edit, hidden: !can(workplace, 'customers:manage') },
            { label: 'Merge a duplicate', icon: 'people-outline', symbol: 'person.2', onPress: merge, hidden: !can(workplace, 'customers:delete') },
            { label: 'Delete', icon: 'trash-outline', symbol: 'trash', onPress: () => void remove(), destructive: true, hidden: !can(workplace, 'customers:delete') },
          ]}
        />
          )}
        />
      )}
    />
  );
}
