import { Linking, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import FormSheet from '@/components/form_sheet';
import SkeletonList from '@/components/skeleton_list';
import api from '@/config/api';
import AGENT_DOWNLOAD_URL from '@/constants/agent_download_url';
import RequirePermission from '@/hoc/require_permission';
import useGet from '@/hooks/useGet';
import type Menu from '@/types/menu';
import type PrintAgent from '@/types/print_agent';
import Button from '@/ui/button';
import IconButton from '@/ui/icon_button';
import Input from '@/ui/input';
import fieldError from '@/utils/field_error';
import toast from '@/utils/toast';
import AgentRow from './agent_row';
import agentSchema from './agent_schema';

/**
 * The branch's PCs that print (the Windows print agent) and their printers, as the web's Settings → Printers. A phone
 * can't run the agent: here a PC is added, its pairing code read off, and each printer told what to print.
 */
export default function PrintersPage() {
  return (
    <RequirePermission permission="devices:manage">
      <PrintersScreen />
    </RequirePermission>
  );
}

function PrintersScreen() {
  // Only the category names are needed (to pick what a kitchen printer prints); the answer is shared with the Menu page.
  const { data: menu } = useGet<Menu>('/menu');
  const { data: agents = [], loading, refreshing, get, update } = useGet<PrintAgent[]>('/print-agents');
  const replace = (saved: PrintAgent) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)));

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <FormSheet
              title="Add a PC"
              schema={agentSchema}
              defaultValues={{ name: 'Counter PC' }}
              submitLabel="Get pairing code"
              onSave={(values) =>
                api.post<PrintAgent>('/print-agents', values).then((res) => {
                  update((current) => [...(current ?? []), res.data]);
                  toast.success('Type the pairing code into the agent');
                })
              }
              fields={({ register, errors }) => <Input label="PC name" required placeholder="e.g. Counter PC" autoCapitalize="words" returnKeyType="done" {...register('name')} error={fieldError(errors, 'name')} />}
              component={({ open }) => <IconButton icon="add" variant="soft" label="Add a PC" onPress={open} />}
            />
          ),
        }}
      />
      <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 px-4 pt-2 pb-32" refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}>
        <View className="gap-2 rounded-card border border-border bg-surface p-4">
          <Text accessibilityRole="header" className="text-heading font-semibold text-ink">
            Print agent for Windows
          </Text>
          <Text className="text-sm text-body">1. Install the agent on the PC the printers are connected to.</Text>
          <Text className="text-sm text-body">2. Add the PC here (+) to get a pairing code.</Text>
          <Text className="text-sm text-body">3. Type the code into the agent. Its printers then show up here.</Text>
          <Text className="text-sm text-muted">Print buttons in this app then send slips and receipts to those printers.</Text>
          <Button variant="outline" size="sm" icon="open-outline" className="mt-1 self-start" onPress={() => void Linking.openURL(AGENT_DOWNLOAD_URL)}>
            Download link
          </Button>
        </View>
        {loading && <SkeletonList rows={2} />}
        {!loading && !agents.length && <Text className="text-sm text-muted">No PC added yet.</Text>}
        {agents.map((agent) => (
          <AgentRow
            key={agent._id}
            agent={agent}
            categories={menu?.categories ?? []}
            onSaved={replace}
            onRemoved={(id) => update((current) => current?.filter((item) => item._id !== id))}
            onRefresh={() => get()}
          />
        ))}
      </ScrollView>
    </>
  );
}
