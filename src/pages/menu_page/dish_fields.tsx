import type FormComponentProps from '@/types/form_component_props';
import type Menu from '@/types/menu';
import CheckList from '@/ui/check_list';
import Input from '@/ui/input';
import Select from '@/ui/select';
import Toggle from '@/ui/toggle';
import addonRule from '@/utils/addon_rule';
import fieldError from '@/utils/field_error';
import PriceRows from './price_rows';

/** A dish: name, category, its price (or sizes), the add-on groups it offers, a description, and hiding it. */
export default function DishFields({ menu, ...form }: FormComponentProps & { menu: Menu }) {
  const { register, errors } = form;
  return (
    <>
      <Input label="Name" required autoCapitalize="words" {...register('name')} error={fieldError(errors, 'name')} />
      <Select label="Category" required placeholder="Pick a category" options={menu.categories.map((category) => ({ value: category._id, label: category.name }))} {...register('categoryId')} error={fieldError(errors, 'categoryId')} />
      <PriceRows {...form} name="sizes" label="Sizes and prices" namePlaceholder="e.g. Half" priceLabel="Price (Rs)" addLabel="Add sizes (Half, Full…)" namesFromTwo />
      {menu.addonGroups.length > 0 && (
        <CheckList
          label="Add-ons"
          options={menu.addonGroups.map((group) => ({ value: group._id, label: `${group.name} · ${addonRule(group)}`, hint: group.options.map((option) => option.name).join(', ') }))}
          {...register('addonGroupIds')}
        />
      )}
      <Input label="Description (optional)" multiline maxLength={200} placeholder="Shown on the QR menu" {...register('description')} error={fieldError(errors, 'description')} />
      <Toggle label="Hide from the menu everywhere" {...register('hidden')} />
    </>
  );
}
