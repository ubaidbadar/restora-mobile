import { router } from 'expo-router';
import { Linking, Text, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import useSafeSpace from '@/hooks/useSafeSpace';
import Button from '@/ui/button';
import Icon from '@/ui/icon';
import IconButton from '@/ui/icon_button';
import ScanHandler from './scan_handler';

/**
 * Point the camera at a table's QR code: a new order for that table opens. The quickest way for a waiter at the table.
 */
export default function ScanTablePage() {
  const [permission, requestPermission] = useCameraPermissions();
  const space = useSafeSpace();

  return (
    <View className="flex-1 bg-ink">
      {permission?.granted ? (
        <ScanHandler />
      ) : (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Icon name="camera-outline" size={44} className="accent-canvas" />
          <Text className="text-center text-base text-canvas">Restora needs the camera to scan the QR code on a table.</Text>
          {permission && (permission.canAskAgain ? <Button onPress={() => void requestPermission()}>Allow camera</Button> : <Button onPress={() => void Linking.openSettings()}>Open Settings to allow</Button>)}
          <Button variant="secondary" onPress={() => router.back()}>
            Pick the table instead
          </Button>
        </View>
      )}
      <View style={{ top: space.top + 8, start: space.sides + 16 }} className="absolute">
        <IconButton icon="close" label="Close" variant="soft" onPress={() => router.back()} />
      </View>
    </View>
  );
}
