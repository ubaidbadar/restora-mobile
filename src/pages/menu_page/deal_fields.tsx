import { Text, View } from 'react-native';
import type FormComponentProps from '@/types/form_component_props';
import type Menu from '@/types/menu';
import CheckList from '@/ui/check_list';
import Input from '@/ui/input';
import Select from '@/ui/select';
import Toggle from '@/ui/toggle';
import addonRule from '@/utils/addon_rule';
import fieldError from '@/utils/field_error';
import DealPartRows from './deal_part_rows';

// The week from Monday; the values are the days the server keeps (0 is Sunday).
const DAYS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
];

/** A deal: name, category and price, the dishes in it, choices (add-on groups such as the drink), and when it is sold. */
export default function DealFields({ menu, ...form }: FormComponentProps & { menu: Menu }) {
  const { register, errors } = form;
  return (
    <>
      <Input label="Name" required autoCapitalize="words" placeholder="e.g. Deal 1" {...register('name')} error={fieldError(errors, 'name')} />
      <Select label="Category" required placeholder="Pick a category" options={menu.categories.map((category) => ({ value: category._id, label: category.name }))} {...register('categoryId')} error={fieldError(errors, 'categoryId')} />
      <Input label="Deal price (Rs)" required keyboardType="number-pad" {...register('price')} error={fieldError(errors, 'price')} />
      <DealPartRows dishes={menu.items.filter((item) => !item.includes?.length)} {...form} />
      {menu.addonGroups.length > 0 && (
        <CheckList
          label="Choices (optional)"
          hint="Let the customer pick, like the drink. Make an add-on group with Rs 0 options for a free choice."
          options={menu.addonGroups.map((group) => ({ value: group._id, label: `${group.name} · ${addonRule(group)}`, hint: group.options.map((option) => option.name).join(', ') }))}
          {...register('addonGroupIds')}
        />
      )}
      <CheckList label="Days it is sold" hint="None ticked: every day." options={DAYS} {...register('days')} />
      <View className="gap-1">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="From" placeholder="12:00" keyboardType="numbers-and-punctuation" maxLength={5} {...register('from')} error={fieldError(errors, 'from')} />
          </View>
          <View className="flex-1">
            <Input label="To" placeholder="16:00" keyboardType="numbers-and-punctuation" maxLength={5} {...register('to')} error={fieldError(errors, 'to')} />
          </View>
        </View>
        <Text className="text-sm text-muted">24-hour times. Leave both empty for all day.</Text>
      </View>
      <Input label="Description (optional)" multiline maxLength={200} placeholder="Shown on the QR menu" {...register('description')} error={fieldError(errors, 'description')} />
      <Toggle label="Hide from the menu everywhere" {...register('hidden')} />
    </>
  );
}
