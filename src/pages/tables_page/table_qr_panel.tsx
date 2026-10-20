import { Share, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type OverlayProps from '@/types/overlay_props';
import type Table from '@/types/table';
import Button from '@/ui/button';
import SheetPanel from '@/ui/sheet_panel';
import tableLink from '@/utils/table_link';

/** The table's QR code, big enough for a guest to scan off the screen, and its link to share. */
export default function TableQrPanel({ table, ...overlay }: OverlayProps & { table: Table }) {
  const link = tableLink(table.qrCode);

  return (
    <SheetPanel {...overlay} title={`QR code · ${table.name}`}>
      <View className="items-center gap-3">
        {/* Always black on white, in dark mode too: scanners need the contrast. */}
        <View className="rounded-card bg-on-primary p-4">
          <QRCode value={link} size={220} />
        </View>
        <Text numberOfLines={1} className="text-sm text-muted">
          {link}
        </Text>
      </View>
      <Button variant="outline" icon="share-outline" onPress={() => void Share.share({ message: link })}>
        Share link
      </Button>
      <Text className="text-center text-sm text-muted">Print table cards from Tables on the web.</Text>
    </SheetPanel>
  );
}
