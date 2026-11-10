import { Text, View } from 'react-native';
import can from '@shared/can';
import FormSheet from '@/components/form_sheet';
import api from '@/config/api';
import THEMES from '@/constants/themes';
import useAuthStore from '@/store/auth_store';
import Button from '@/ui/button';
import Select from '@/ui/select';
import fieldError from '@/utils/field_error';
import toast from '@/utils/toast';
import appearanceSchema from './appearance_schema';

const MODES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Follow device' },
];

/** Restaurant-wide colour theme and light/dark mode; visible to everyone, editable by managers. */
export default function AppearanceSection() {
  const me = useAuthStore((state) => state.me);
  const appearance = me?.workplace?.settings.appearance ?? { theme: 'indigo', mode: 'light', sidebar: 'plain' };
  const canEdit = can(me?.workplace, 'settings:manage');
  const selected = THEMES.find((theme) => theme.value === appearance.theme)?.label ?? 'Midnight Indigo';
  const mode = MODES.find((option) => option.value === appearance.mode)?.label ?? 'Light';

  return (
    <View className="gap-3 p-3">
      <View className="gap-1">
        <Text className="text-base font-semibold text-ink">{selected}</Text>
        <Text className="text-sm text-body">{mode} · Shared by everyone in this restaurant</Text>
      </View>
      {canEdit && (
        <FormSheet
          title="Appearance"
          submitLabel="Save appearance"
          schema={appearanceSchema}
          defaultValues={{ appearance }}
          onSave={(values) =>
            api.patch('/settings', values).then((res) => {
              useAuthStore.getState().setSettings(res.data);
              toast.success('Appearance saved for the whole team');
            })
          }
          fields={({ register, errors }) => (
            <View className="gap-4">
              <Select label="Theme" required options={THEMES.map((theme) => ({ value: theme.value, label: theme.label }))} {...register('appearance.theme')} error={fieldError(errors, 'appearance.theme')} />
              <Select label="Light or dark" required options={MODES} {...register('appearance.mode')} error={fieldError(errors, 'appearance.mode')} />
              <Text className="text-sm text-muted">The theme is applied to the whole restaurant. Follow device respects each phone or tablet's appearance.</Text>
            </View>
          )}
          component={({ open }) => <Button variant="outline" onPress={open}>Change appearance</Button>}
        />
      )}
    </View>
  );
}
