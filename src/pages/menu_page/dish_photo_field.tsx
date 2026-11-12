import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '@/types/form_component_props';
import Button from '@/ui/button';
import toast from '@/utils/toast';

/** Pick a compressed JPEG without browser APIs; the backend makes the stored photo variants. */
export default function DishPhotoField({ control, setValue }: Pick<FormComponentProps, 'control' | 'setValue'>) {
  const photo = useWatch({ control, name: 'photo' }) as string | null | undefined;

  const pick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
        quality: 0.75,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const data = asset.base64;
      if (!data) {
        toast.error('Could not read that image. Try a JPEG photo.');
        return;
      }
      // The backend accepts a maximum 5 MB decoded image.
      if (Math.ceil(data.length * 3 / 4) > 5_000_000) {
        toast.error('This photo is still too large. Try a smaller image.');
        return;
      }
      setValue('photo', `data:image/jpeg;base64,${data}`, { shouldDirty: true });
    } catch {
      toast.error('Could not load that photo. Try another image.');
    }
  };

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-ink">Photo (optional)</Text>
      <View className="flex-row items-center gap-3">
        <View className="size-24 items-center justify-center overflow-hidden rounded-card border border-border bg-sunken">
          {photo ? <Image source={{ uri: photo }} contentFit="cover" className="size-full" /> : <Text className="text-xs text-muted">No photo</Text>}
        </View>
        <View className="flex-1 gap-2">
          <Button variant="outline" size="sm" icon="image-outline" onPress={() => void pick()}>{photo ? 'Change photo' : 'Pick photo'}</Button>
          {!!photo && <Button variant="ghost" size="sm" onPress={() => setValue('photo', null, { shouldDirty: true })}>Remove photo</Button>}
        </View>
      </View>
      <Text className="text-xs text-muted">Guests see this photo on the QR menu. Square or landscape photos work best.</Text>
    </View>
  );
}
