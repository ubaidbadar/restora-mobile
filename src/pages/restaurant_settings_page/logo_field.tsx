import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import Button from '@/ui/button';
import toast from '@/utils/toast';

/** The restaurant logo is stored by the existing settings endpoint as a data URL or a saved photo URL. */
export default function LogoField({ control, setValue }: Pick<FormComponentProps, 'control' | 'setValue'>) {
  const logo = useWatch({ control, name: 'logo' }) as string | null | undefined;

  const pick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], base64: true, quality: 0.75 });
      if (result.canceled || !result.assets[0]) return;
      const data = result.assets[0].base64;
      if (!data || Math.ceil(data.length * 3 / 4) > 5_000_000) {
        toast.error('Please pick a JPEG, PNG or WebP logo under 5 MB.');
        return;
      }
      setValue('logo', `data:image/jpeg;base64,${data}`, { shouldDirty: true });
    } catch {
      toast.error('Could not load that logo. Try another image.');
    }
  };

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink">Restaurant logo</Text>
      <View className="flex-row items-center gap-3">
        <View className="size-24 items-center justify-center overflow-hidden rounded-card border border-border bg-sunken">
          {logo ? <Image source={{ uri: logo }} contentFit="contain" className="size-full" /> : <Text className="text-sm text-muted">No logo</Text>}
        </View>
        <View className="flex-1 gap-2">
          <Button variant="outline" icon="image-outline" size="sm" onPress={() => void pick()}>{logo ? 'Change logo' : 'Choose logo'}</Button>
          {!!logo && <Button variant="ghost" size="sm" onPress={() => setValue('logo', null, { shouldDirty: true })}>Remove logo</Button>}
        </View>
      </View>
      <Text className="text-xs text-muted">Used on customer receipts and around the restaurant app.</Text>
    </View>
  );
}
