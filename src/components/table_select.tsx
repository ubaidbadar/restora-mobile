import useGet from '@/hooks/useGet';
import type FormComponentProps from '@/types/form_component_props';
import type Table from '@/types/table';
import Input from '@/ui/input';
import Select from '@/ui/select';
import Skeleton from '@/ui/skeleton';
import fieldError from '@/utils/field_error';

/** The branch's tables (`tableId`), loaded when the order turns dine-in. Without tables set up: a box to type one (`tableName`). */
export default function TableSelect({ register, errors }: Pick<FormComponentProps, 'register' | 'errors'>) {
  const { data, loading } = useGet<Table[]>('/tables');
  if (loading) return <Skeleton className="h-12 w-full rounded-control" />;
  const tables = (data ?? []).filter((table) => !table.archived);
  if (!tables.length) return <Input label="Table" placeholder="e.g. 4" required {...register('tableName')} error={fieldError(errors, 'tableName')} />;
  return (
    <Select
      label="Table"
      required
      placeholder="Pick a table"
      options={tables.map((table) => ({ value: table._id, label: [table.name, table.section, table.seats && `${table.seats} seats`].filter(Boolean).join(' · ') }))}
      {...register('tableId')}
      error={fieldError(errors, 'tableId')}
    />
  );
}
