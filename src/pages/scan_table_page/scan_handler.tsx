import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import getCache from '@/store/get_cache';
import type FloorTable from '@/types/floor_table';
import Button from '@/ui/button';
import Icon from '@/ui/icon';
import IconButton from '@/ui/icon_button';
import toast from '@/utils/toast';

/**
 * The camera. A table's QR holds its guest link (…/t/<code>); the table is found among the branch's tables. The torch
 * helps in a dim hall; a worn or missing sticker, or no camera, still leaves a way on: picking the table from the list.
 */
export default function ScanHandler() {
  const [scan, setScan] = useState({ seen: '', torch: false, failed: false });
  const bottom = useSafeAreaInsets().bottom;

  const handle = (data: string) => {
    if (data === scan.seen) return;
    setScan({ ...scan, seen: data });
    const code = /\/t\/([^/?#]+)/.exec(data)?.[1];
    const tables = (getCache.get(getCache.keyOf('/tables/floor')) as FloorTable[] | undefined) ?? [];
    const table = code && tables.find((item) => item.qrCode === code);
    if (!table) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(code ? 'This QR code is not a table of this branch' : 'Not a Restora table QR code');
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: '/order/new', params: { table: table._id } });
  };

  return (
    <View className="flex-1">
      {scan.failed ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Icon name="videocam-off-outline" size={44} className="accent-canvas" />
          <Text className="text-center text-base text-canvas">{"The camera can't start on this device."}</Text>
        </View>
      ) : (
        <>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            enableTorch={scan.torch}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => handle(data)}
            onMountError={() => setScan({ ...scan, failed: true })}
          />
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center gap-6">
            <View className="size-64 rounded-panel border-4 border-on-primary" />
            <Text className="rounded-control bg-scrim px-4 py-2 text-base font-medium text-on-primary">Point at the QR code on the table</Text>
          </View>
        </>
      )}
      <View style={{ paddingBottom: bottom + 16 }} className="absolute inset-x-0 bottom-0 flex-row items-center justify-center gap-3 px-6">
        {!scan.failed && (
          <IconButton
            icon={scan.torch ? 'flashlight' : 'flashlight-outline'}
            label={scan.torch ? 'Turn the torch off' : 'Turn the torch on'}
            variant="soft"
            onPress={() => setScan({ ...scan, torch: !scan.torch })}
          />
        )}
        <Button variant="secondary" icon="grid-outline" onPress={() => router.back()}>
          Pick the table instead
        </Button>
      </View>
    </View>
  );
}
