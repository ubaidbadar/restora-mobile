import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useWatch } from 'react-hook-form';
import { Text, View } from 'react-native';
import type FormComponentProps from '@/types/form_component_props';
import Button from '@/ui/button';
import Icon from '@/ui/icon';
import toast from '@/utils/toast';

/** The server takes images of up to 5 MB. */
const MAX_BYTES = 5 * 1024 * 1024;

/** The restaurant's logo: a square photo from the library, put in the form as a data URL that the server uploads. */
export default function LogoField({ control, setValue }: FormComponentProps) {
  const logo: string | undefined = useWatch({ control, name: 'logo' });

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true });
    const base64 = result.assets?.[0]?.base64;
    if (result.canceled || !base64) return;
    if (base64.length * 0.75 > MAX_BYTES) return toast.error('This image is too big. Pick a smaller one.');
    // The picker gives JPEG data.
    setValue('logo', `data:image/jpeg;base64,${base64}`, { shouldDirty: true });
  };

  return (
    <View className="flex-row items-center gap-4">
      <View className="size-20 items-center justify-center overflow-hidden rounded-card border border-border bg-sunken">
        {logo ? (
          <Image source={{ uri: logo }} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityLabel="Restaurant logo" />
        ) : (
          <Icon name="storefront-outline" size={28} className="accent-muted" />
        )}
      </View>
      <View className="flex-1 gap-2">
        <View className="flex-row flex-wrap gap-2">
          <Button variant="outline" icon="image-outline" onPress={() => void pick()}>
            {logo ? 'Change logo' : 'Upload logo'}
          </Button>
          {logo && (
            <Button variant="ghost" icon="trash-outline" onPress={() => setValue('logo', undefined, { shouldDirty: true })}>
              Remove
            </Button>
          )}
        </View>
        <Text className="text-xs text-muted">Optional. Shown on receipts and in the app.</Text>
      </View>
    </View>
  );
}
