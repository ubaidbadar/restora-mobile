import { Stack } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import FormSheet from '@/components/form_sheet';
import SkeletonList from '@/components/skeleton_list';
import api from '@/config/api';
import RequirePermission from '@/hoc/require_permission';
import useGet from '@/hooks/useGet';
import type FloorTable from '@/types/floor_table';
import type Table from '@/types/table';
import Button from '@/ui/button';
import Input from '@/ui/input';
import confirm from '@/utils/confirm';
import fieldError from '@/utils/field_error';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import TableQr from '@/pages/tables_page/table_qr';
import batchSchema from './batch_schema';
import tableSchema from './table_schema';

function TableFields({ register, errors }: { register: (name: string) => { name: string; control: never }; errors: Record<string, unknown> }) {
  return (
    <>
      <Input label="Table name" required placeholder="e.g. T4 or Family 2" {...register('name')} error={fieldError(errors, 'name')} />
      <Input label="Section (optional)" placeholder="e.g. Hall or Rooftop" {...register('section')} error={fieldError(errors, 'section')} />
      <Input label="Seats (optional)" keyboardType="number-pad" {...register('seats')} error={fieldError(errors, 'seats')} />
    </>
  );
}

function BatchFields({ register, errors }: { register: (name: string) => { name: string; control: never }; errors: Record<string, unknown> }) {
  return (
    <>
      <Text className="text-sm text-muted">For example, prefix T and numbers 1–20 creates T1 through T20. Existing names are skipped.</Text>
      <Input label="Name starts with" placeholder="e.g. T" {...register('prefix')} error={fieldError(errors, 'prefix')} />
      <View className="flex-row gap-3">
        <View className="flex-1"><Input label="From number" required keyboardType="number-pad" {...register('from')} error={fieldError(errors, 'from')} /></View>
        <View className="flex-1"><Input label="To number" required keyboardType="number-pad" {...register('to')} error={fieldError(errors, 'to')} /></View>
      </View>
      <Input label="Section (optional)" placeholder="e.g. Hall" {...register('section')} error={fieldError(errors, 'section')} />
      <Input label="Seats at each (optional)" keyboardType="number-pad" {...register('seats')} error={fieldError(errors, 'seats')} />
    </>
  );
}

function TableRow({ table, onSaved }: { table: FloorTable; onSaved: (...tables: Table[]) => void }) {
  const archive = async () => {
    const ok = await confirm({
      title: `Archive ${table.name}?`,
      message: 'The table leaves the floor, and guests cannot use its active QR code. Past orders keep their table name. You can bring it back later.',
      confirmLabel: 'Archive',
      destructive: true,
    });
    if (!ok) return;
    api.post<Table>(`/tables/${table._id}/archive`).then((res) => {
      onSaved(res.data);
      toast.success(`${table.name} archived`);
    }).catch((err) => toast.error(getAxiosMessage(err)));
  };

  const restore = () => api.post<Table>(`/tables/${table._id}/restore`).then((res) => {
    onSaved(res.data);
    toast.success(`${table.name} is back`);
  }).catch((err) => toast.error(getAxiosMessage(err)));

  const regenerate = async () => {
    const ok = await confirm({
      title: `Generate a new QR code for ${table.name}?`,
      message: 'Only generate a new code when the current one should be replaced. Print or share the new QR afterward.',
      confirmLabel: 'Generate QR',
    });
    if (!ok) return;
    api.post<Table>(`/tables/${table._id}/qr`).then((res) => {
      onSaved(res.data);
      toast.success('New QR code generated');
    }).catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-4">
      <View className="flex-row justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-ink">{table.name}</Text>
          <Text className="text-sm text-muted">{[table.section, table.seats ? `${table.seats} seats` : '', table.archived ? 'Archived' : 'Active'].filter(Boolean).join(' · ')}</Text>
        </View>
      </View>
      {table.archived ? <Button variant="outline" onPress={() => void restore()}>Bring back</Button> : (
        <View className="flex-row flex-wrap gap-2">
          <FormSheet
            title={`Edit ${table.name}`}
            schema={tableSchema}
            defaultValues={{ name: table.name, section: table.section ?? '', seats: table.seats ? String(table.seats) : '' }}
            onSave={(values) => api.patch<Table>(`/tables/${table._id}`, values).then((res) => {
              onSaved(res.data);
              toast.success(`${table.name} updated`);
            })}
            fields={(form) => <TableFields {...form} />}
            component={({ open }) => <Button variant="outline" size="sm" onPress={open}>Edit</Button>}
          />
          <TableQr table={table} component={({ open }) => <Button variant="outline" size="sm" onPress={open}>QR code</Button>} />
          <Button variant="outline" size="sm" onPress={() => void regenerate()}>New QR</Button>
          <Button variant="outline" size="sm" onPress={() => void archive()}>Archive</Button>
        </View>
      )}
    </View>
  );
}

/** Manage the branch's tables without touching the live floor's orders, guest calls or bookings. */
function TableManagement() {
  const { data: all = [], loading, refreshing, error, get, update } = useGet<FloorTable[]>('/tables/floor');
  const save = (...saved: Table[]) => update((current = []) => {
    const next = [...current];
    for (const table of saved) {
      const at = next.findIndex((row) => row._id === table._id);
      if (at >= 0) next[at] = { ...next[at]!, ...table };
      else next.push({ ...table, orders: [], requests: [], booking: null });
    }
    return next;
  });
  const active = all.filter((row) => !row.archived);
  const archived = all.filter((row) => row.archived);

  return (
    <>
      <Stack.Screen options={{ title: 'Manage tables' }} />
      <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 px-4 pt-3 pb-32"
        refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}
      >
        <View className="flex-row flex-wrap gap-2">
          <FormSheet title="Add table" schema={tableSchema} defaultValues={{ name: '', section: '', seats: '' }} submitLabel="Add table"
            onSave={(values) => api.post<Table>('/tables', values).then((res) => {
              save(res.data);
              toast.success(`Table ${res.data.name} added`);
            })}
            fields={(form) => <TableFields {...form} />}
            component={({ open }) => <Button icon="add" onPress={open}>Add table</Button>}
          />
          <FormSheet title="Add many tables" schema={batchSchema} defaultValues={{ prefix: 'T', from: '1', to: '10', section: '', seats: '' }} submitLabel="Add tables"
            onSave={(values) => {
              const names = Array.from({ length: values.to - values.from + 1 }, (_, index) => `${values.prefix}${values.from + index}`);
              return api.post<Table[]>('/tables/batch', { names, section: values.section || undefined, seats: values.seats }).then((res) => {
                save(...res.data);
                toast.success(`${res.data.length} tables added`);
              });
            }}
            fields={(form) => <BatchFields {...form} />}
            component={({ open }) => <Button variant="outline" onPress={open}>Add many</Button>}
          />
        </View>
        {!!error && <Text className="text-sm text-danger-700">Could not refresh tables. Pull down to try again.</Text>}
        {loading && <SkeletonList rows={4} />}
        {!loading && !all.length && <Text className="text-sm text-muted">No tables here yet. Add one to give it a QR code.</Text>}
        {active.length > 0 && <Text accessibilityRole="header" className="text-heading font-semibold text-ink">Active tables · {active.length}</Text>}
        {active.map((table) => <TableRow key={table._id} table={table} onSaved={save} />)}
        {archived.length > 0 && <Text accessibilityRole="header" className="mt-2 text-heading font-semibold text-ink">Archived · {archived.length}</Text>}
        {archived.map((table) => <TableRow key={table._id} table={table} onSaved={save} />)}
      </ScrollView>
    </>
  );
}

export default function TableManagePage() {
  return <RequirePermission permission="tables:manage"><TableManagement /></RequirePermission>;
}
