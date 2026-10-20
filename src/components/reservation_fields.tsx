import { View } from 'react-native';
import TIME_OPTIONS from '@/constants/time_options';
import type FormComponentProps from '@/types/form_component_props';
import Input from '@/ui/input';
import Select from '@/ui/select';
import dayOptions from '@/utils/day_options';
import fieldError from '@/utils/field_error';
import TableSelect from './table_select';

interface ReservationFieldsProps extends Pick<FormComponentProps, 'register' | 'errors'> {
  /** Editing an existing booking: the guest cannot be changed, so phone and name are left out. */
  editing?: boolean;
}

/** A booking: the guest (new bookings only), how many, which day and time, the table, a note. */
export default function ReservationFields({ register, errors, editing = false }: ReservationFieldsProps) {
  return (
    <>
      {!editing && (
        <>
          <Input label="Mobile number" keyboardType="phone-pad" autoComplete="tel" placeholder="0300 1234567" required {...register('phone')} error={fieldError(errors, 'phone')} />
          <Input label="Guest name" autoCapitalize="words" required {...register('name')} error={fieldError(errors, 'name')} />
        </>
      )}
      <Input label="How many people" keyboardType="number-pad" required {...register('partySize')} error={fieldError(errors, 'partySize')} />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Select label="Day" required options={dayOptions()} {...register('date')} error={fieldError(errors, 'date')} />
        </View>
        <View className="flex-1">
          <Select label="Time" required options={TIME_OPTIONS} {...register('time')} error={fieldError(errors, 'time')} />
        </View>
      </View>
      <TableSelect register={register} errors={errors} />
      <Input label="Note (advance payment, occasion, seating)" multiline placeholder="Rs 5,000 advance paid by JazzCash. Iftar, family hall." {...register('note')} />
    </>
  );
}
