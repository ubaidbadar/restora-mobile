import * as WebBrowser from 'expo-web-browser';
import { Text, View } from 'react-native';
import WEB_URL from '@/constants/web_url';
import MoreRow from './more_row';

/** What is still set up on the web: restaurant settings, branches, tables and roles. */
export default function WebSection() {
  return (
    <>
      <View className="px-4 pt-3">
        <Text className="text-sm text-muted">Restaurant settings, branches, tables and roles are set up on the web.</Text>
      </View>
      <MoreRow icon="settings-outline" label="Open settings on the web" onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/settings`)} />
    </>
  );
}
