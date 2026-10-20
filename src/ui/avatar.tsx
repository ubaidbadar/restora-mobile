import { Image } from 'expo-image';
import { Text, View } from 'react-native';

const SIZES = {
  sm: { size: 36, box: 'size-9', text: 'text-xs' },
  md: { size: 44, box: 'size-11', text: 'text-sm' },
  lg: { size: 64, box: 'size-16', text: 'text-xl' },
} as const;

interface AvatarProps {
  initials: string;
  image?: string | null;
  size?: keyof typeof SIZES;
}

/** A person's photo, or their initials on the brand tint. */
export default function Avatar({ initials, image, size = 'md' }: AvatarProps) {
  const { size: side, box, text } = SIZES[size];
  if (image) return <Image source={image} contentFit="cover" style={{ width: side, height: side, borderRadius: side / 2 }} />;
  return (
    <View className={`items-center justify-center rounded-pill bg-primary-soft ${box}`}>
      <Text className={`font-semibold text-accent-text ${text}`}>{initials}</Text>
    </View>
  );
}
