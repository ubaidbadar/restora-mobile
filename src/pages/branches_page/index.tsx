import { Stack } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import FormSheet from '@/components/form_sheet';
import SkeletonList from '@/components/skeleton_list';
import api from '@/config/api';
import RequirePermission from '@/hoc/require_permission';
import useGet from '@/hooks/useGet';
import useAuthStore from '@/store/auth_store';
import type Branch from '@/types/branch';
import type FormComponentProps from '@/types/form_component_props';
import Button from '@/ui/button';
import Input from '@/ui/input';
import confirm from '@/utils/confirm';
import fieldError from '@/utils/field_error';
import formatPhone from '@/utils/format_phone';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import branchSchema from './branch_schema';

function BranchFields({ register, errors }: Pick<FormComponentProps, 'register' | 'errors'>) {
  return (
    <>
      <Input label="Branch name" required autoCapitalize="words" placeholder="e.g. Gulberg" {...register('name')} error={fieldError(errors, 'name')} />
      <Input label="Street address" placeholder="e.g. 12 Main Boulevard" {...register('address')} />
      <Input label="Area" placeholder="e.g. Gulberg III" {...register('area')} />
      <Input label="City" placeholder="e.g. Lahore" {...register('city')} />
      <Input label="Branch phone (optional)" keyboardType="phone-pad" {...register('phone')} error={fieldError(errors, 'phone')} />
    </>
  );
}

function BranchRow({ branch, isLastOpen, onSaved }: { branch: Branch; isLastOpen: boolean; onSaved: (saved: Branch) => void }) {
  const archived = branch.isActive === false;

  const act = async (action: 'archive' | 'reopen') => {
    const agreed = await confirm({
      title: `${action === 'archive' ? 'Archive' : 'Reopen'} ${branch.name}?`,
      message: action === 'archive' ? 'The orders and reports stay, but POS terminals stop working and affected staff may lose access.' : 'Staff who previously lost branch access may need it granted again.',
      confirmLabel: action === 'archive' ? 'Archive' : 'Reopen',
      destructive: action === 'archive',
    });
    if (!agreed) return;
    api.post<Branch>(`/branches/${branch._id}/${action}`).then((res) => {
      onSaved(res.data);
      useAuthStore.getState().setBranch(res.data);
      toast.success(`${branch.name} ${action === 'archive' ? 'archived' : 'reopened'}`);
    }).catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-4">
      <View className="gap-1">
        <Text className="text-base font-semibold text-ink">{branch.name}</Text>
        <Text className="text-sm text-muted">
          {[branch.area, branch.city, branch.phone ? formatPhone(branch.phone) : '', archived ? 'Archived' : 'Open'].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <FormSheet title={`Edit ${branch.name}`} schema={branchSchema}
          defaultValues={{ name: branch.name, address: branch.address ?? '', area: branch.area ?? '', city: branch.city ?? '', phone: branch.phone ?? '' }}
          onSave={(values) => api.patch<Branch>(`/branches/${branch._id}`, values).then((res) => {
            onSaved(res.data);
            useAuthStore.getState().setBranch(res.data);
            toast.success('Branch saved');
          })}
          fields={(form) => <BranchFields {...form} />}
          component={({ open }) => <Button variant="outline" size="sm" onPress={open}>Edit</Button>}
        />
        {archived ? <Button variant="outline" size="sm" onPress={() => void act('reopen')}>Reopen</Button> :
          !isLastOpen ? <Button variant="outline" size="sm" onPress={() => void act('archive')}>Archive</Button> : null}
      </View>
    </View>
  );
}

/** Each branch owns its orders and terminals; customers/menu/tax remain restaurant-wide. */
function BranchesScreen() {
  const { data: branches = [], loading, refreshing, error, get, update } = useGet<Branch[]>('/branches?all=true');
  const open = branches.filter((row) => row.isActive !== false).length;

  return (
    <>
      <Stack.Screen options={{ title: 'Branches' }} />
      <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-3 px-4 pt-3 pb-32"
        refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}>
        <Text className="text-sm text-muted">Each branch has its own orders, bookings and POS terminals. Customers, khata, menu and tax are shared.</Text>
        <FormSheet title="Add branch" schema={branchSchema} submitLabel="Add branch"
          defaultValues={{ name: '', address: '', area: '', city: '', phone: '' }}
          onSave={(values) => api.post<Branch>('/branches', values).then((res) => {
            update((current) => [...(current ?? []), res.data]);
            useAuthStore.getState().setBranch(res.data);
            toast.success(`${res.data.name} added. Give your team access under Staff.`);
          })}
          fields={(form) => <BranchFields {...form} />}
          component={({ open: add }) => <Button icon="add" onPress={add}>Add branch</Button>}
        />
        {!!error && <Text className="text-sm text-danger-700">Could not load branches. Pull down to retry.</Text>}
        {loading && <SkeletonList rows={3} />}
        {!loading && !branches.length && <Text className="text-sm text-muted">No branches yet.</Text>}
        {branches.map((row) => (
          <BranchRow key={row._id} branch={row} isLastOpen={open <= 1} onSaved={(saved) =>
            update((current) => current?.map((item) => item._id === saved._id ? saved : item))} />
        ))}
      </ScrollView>
    </>
  );
}

export default function BranchesPage() {
  return <RequirePermission permission="branches:manage"><BranchesScreen /></RequirePermission>;
}
