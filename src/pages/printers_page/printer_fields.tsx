import { useWatch } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import type MenuCategory from '@/types/menu_category';
import CheckList from '@/ui/check_list';
import Input from '@/ui/input';
import Tabs from '@/ui/tabs';
import fieldError from '@/utils/field_error';

const PRINTS = [
  { value: 'kitchen', label: 'Kitchen slips' },
  { value: 'receipt', label: 'Customer receipts' },
];

const WIDTHS = [
  { value: '48', label: '80 mm roll' },
  { value: '32', label: '58 mm roll' },
];

/** What staff call a printer, what it prints (a kitchen printer can take only some categories), and its paper. */
export default function PrinterFields({ categories, register, errors, control }: FormComponentProps & { categories: MenuCategory[] }) {
  const prints: string[] = useWatch({ control, name: 'prints' }) ?? [];
  return (
    <>
      <Input label="Name" required placeholder="e.g. Kitchen, Bar, Counter" autoCapitalize="words" returnKeyType="done" {...register('label')} error={fieldError(errors, 'label')} />
      <CheckList label="Prints" options={PRINTS} {...register('prints')} />
      {prints.includes('kitchen') && categories.length > 0 && (
        <CheckList
          label="Only these categories"
          hint="Leave all empty to print every dish. Tick Drinks on the bar printer, for example."
          options={categories.map((category) => ({ value: category._id, label: category.name }))}
          {...register('categoryIds')}
        />
      )}
      <Tabs options={WIDTHS} {...register('width')} />
      <Input label="Copies" keyboardType="number-pad" returnKeyType="done" {...register('copies')} error={fieldError(errors, 'copies')} />
    </>
  );
}
