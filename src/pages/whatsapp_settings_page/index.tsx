import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { z } from 'zod';
import FormSheet from '@/components/form_sheet';
import SkeletonList from '@/components/skeleton_list';
import api from '@/config/api';
import WEB_URL from '@/constants/web_url';
import RequirePermission from '@/hoc/require_permission';
import useGet from '@/hooks/useGet';
import Button from '@/ui/button';
import Input from '@/ui/input';
import confirm from '@/utils/confirm';
import fieldError from '@/utils/field_error';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';

interface Connection {
  _id: string;
  phoneNumberId: string;
  phoneNumberDisplay: string;
  status: 'connected' | 'disconnected' | 'token_expired' | 'number_pending';
  invoiceOnComplete?: boolean;
}
interface SignupConfig { enabled: boolean; appId: string | null; configId: string | null }

const pinSchema = z.object({ pin: z.string().regex(/^\d{6}$/, 'Enter a six-digit PIN') });

function ConnectionsScreen() {
  const { data: connections = [], loading, refreshing, error, get, update } = useGet<Connection[]>('/whatsapp/connections');
  const { data: config } = useGet<SignupConfig>('/whatsapp/signup/config');

  const disconnect = async (connection: Connection) => {
    const yes = await confirm({
      title: 'Disconnect WhatsApp?',
      message: 'Future WhatsApp replies and ordering will stop until you reconnect this number.',
      confirmLabel: 'Disconnect',
      destructive: true,
    });
    if (!yes) return;
    api.post(`/whatsapp/connections/${connection._id}/disconnect`).then(() => {
      update((rows) => rows?.map((row) => row._id === connection._id ? { ...row, status: 'disconnected' } : row));
      toast.success('WhatsApp disconnected from Restora');
    }).catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 px-4 pt-3 pb-32"
      refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}
    >
      <View className="gap-3 rounded-card border border-border bg-surface p-4">
        <Text accessibilityRole="header" className="text-heading font-semibold text-ink">Connect your number</Text>
        <Text className="text-sm text-body">Each restaurant uses its own WhatsApp Business number. Connect or reconnect through Meta&apos;s secure web authorization.</Text>
        {config?.enabled === false && <Text className="text-sm text-warning-800">WhatsApp connection setup is not available right now. Contact Restora support.</Text>}
        {config?.enabled && config.appId && config.configId && (
          <Button variant="outline" icon="open-outline"
            onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/settings/whatsapp`)}>
            Open Meta signup on web
          </Button>
        )}
        <Text className="text-xs text-muted">You may need to sign in separately in the browser and select the correct restaurant branch. The Meta authorization callback returns to the web app; this app does not handle the one-time code.</Text>
      </View>
      <Text accessibilityRole="header" className="text-heading font-semibold text-ink">Connected numbers · {connections.length}</Text>
      {loading && !connections.length && <SkeletonList rows={2} />}
      {error && !connections.length && (
        <View className="gap-2">
          <Text className="text-sm text-danger-700">Could not load WhatsApp connections.</Text>
          <Button variant="outline" onPress={() => get()}>Try again</Button>
        </View>
      )}
      {!loading && !error && !connections.length && (
        <Text className="rounded-control bg-surface p-4 text-sm text-muted">No WhatsApp number connected yet. Finish Meta authorization in the web app, then refresh this page.</Text>
      )}
      {connections.map((connection) => (
        <View key={connection._id} className="gap-3 rounded-card border border-border bg-surface p-4">
          <Text className="text-base font-semibold text-ink">{connection.phoneNumberDisplay}</Text>
          <Text className={`text-sm ${connection.status === 'connected' ? 'text-success-700' : 'text-warning-800'}`}>
            {connection.status === 'connected' ? 'Connected · Ready for messages'
              : connection.status === 'number_pending' ? 'Registration required'
              : connection.status === 'token_expired' ? 'Reconnect required' : 'Disconnected'}
          </Text>
          {connection.status === 'number_pending' && (
            <FormSheet
              title="Register WhatsApp number"
              schema={pinSchema}
              defaultValues={{ pin: '' }}
              submitLabel="Register number"
              onSave={({ pin }) =>
                api.post(`/whatsapp/connections/${connection._id}/register`, { pin }).then(() => {
                  update((rows) => rows?.map((row) => row._id === connection._id ? { ...row, status: 'connected' } : row));
                  toast.success('Phone registered successfully');
                })
              }
              fields={({ register, errors }) => (
                <View className="gap-3">
                  <Input label="Six-digit registration PIN" required secureTextEntry keyboardType="number-pad" maxLength={6} {...register('pin')} error={fieldError(errors, 'pin')} />
                  <Text className="text-sm text-muted">Keep this PIN for Meta verification; do not share it with Restora support.</Text>
                </View>
              )}
              component={({ open }) => <Button onPress={open}>Complete registration</Button>}
            />
          )}
          {connection.status === 'token_expired' && <Text className="text-sm text-muted">Authorization expired. Reconnect this number through Meta above.</Text>}
          {connection.status === 'connected' && (
            <View className="gap-2">
              <Button variant="outline" icon="chatbubbles-outline" onPress={() => router.push('/more/whatsapp')}>Open inbox</Button>
              <Button variant="outline" onPress={() => {
                api.patch(`/whatsapp/connections/${connection._id}`, { invoiceOnComplete: !connection.invoiceOnComplete })
                  .then(() => {
                    update((rows) => rows?.map((row) => row._id === connection._id ? { ...row, invoiceOnComplete: !connection.invoiceOnComplete } : row));
                    toast.success('Invoice preference saved');
                  }).catch((err) => toast.error(getAxiosMessage(err)));
              }}>
                {connection.invoiceOnComplete ? 'Completed-order invoices: On' : 'Completed-order invoices: Off'}
              </Button>
            </View>
          )}
          {connection.status !== 'disconnected' && (
            <Button variant="outline" onPress={() => void disconnect(connection)}>Disconnect number</Button>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

/** Branch WhatsApp connections, registration and invoice preference without browser-specific Meta OAuth. */
export default function WhatsAppSettingsPage() {
  return <RequirePermission permission="devices:manage"><ConnectionsScreen /></RequirePermission>;
}
