import { Pressable, Text, View } from 'react-native';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import type MenuCategory from '@/types/menu_category';
import type PrintAgent from '@/types/print_agent';
import Badge from '@/ui/badge';
import Button from '@/ui/button';
import Icon from '@/ui/icon';
import MenuSheet from '@/ui/menu_sheet';
import confirm from '@/utils/confirm';
import formatAgo from '@/utils/format_ago';
import getAxiosMessage from '@/utils/get_axios_message';
import minutesSince from '@/utils/minutes_since';
import toast from '@/utils/toast';
import PrinterRow from './printer_row';

interface AgentRowProps {
  agent: PrintAgent;
  categories: MenuCategory[];
  onSaved: (agent: PrintAgent) => void;
  onRemoved: (id: string) => void;
  /** Reads the agents again: the person asks, to see that the agent has paired. */
  onRefresh: () => void;
}

/** An agent is online while it has been heard from in the last two minutes. */
const ONLINE_MINUTES = 2;

/** One PC with a print agent: its state, the pairing code while it waits, and its printers. */
export default function AgentRow({ agent, categories, onSaved, onRemoved, onRefresh }: AgentRowProps) {
  const branch = useAuthStore((state) => state.me?.workplace?.branches.find((item) => item._id === agent.branchId));
  const waiting = !agent.lastSeenAt;
  const online = !!agent.lastSeenAt && minutesSince(agent.lastSeenAt) < ONLINE_MINUTES;
  const expired = !!agent.pairing && minutesSince(agent.pairing.expiresAt) >= 0;
  const details = [branch?.name, agent.version && `version ${agent.version}`, agent.lastSeenAt && !online && `seen ${formatAgo(agent.lastSeenAt).toLowerCase()}`].filter(Boolean).join(' · ');

  const newCode = () =>
    api
      .post<PrintAgent>(`/print-agents/${agent._id}/code`)
      .then((res) => onSaved(res.data))
      .catch((err) => toast.error(getAxiosMessage(err)));

  const remove = async () => {
    if (!(await confirm({ title: `Remove ${agent.name}?`, message: 'It stops printing at once. Add the PC again to pair it with a new code.', confirmLabel: 'Remove', destructive: true }))) return;
    await api
      .delete(`/print-agents/${agent._id}`)
      .then(() => {
        onRemoved(agent._id);
        toast.success(`${agent.name} removed`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <View className="overflow-hidden rounded-card border border-border bg-surface">
      <MenuSheet
        title={agent.name}
        items={[
          { label: 'Check again', icon: 'refresh-outline', symbol: 'arrow.clockwise', onPress: onRefresh },
          { label: 'New pairing code', icon: 'key-outline', symbol: 'key', onPress: () => void newCode(), hidden: !expired },
          { label: 'Remove', icon: 'trash-outline', symbol: 'trash', destructive: true, onPress: () => void remove() },
        ]}
        component={({ open }) => (
          <Pressable accessibilityRole="button" onPress={open} onLongPress={open} className="min-h-14 flex-row items-center gap-3 px-4 py-3 active:bg-sunken">
            <Icon name="desktop-outline" size={22} />
            <View className="flex-1 gap-0.5">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <Text numberOfLines={1} className="shrink text-base font-semibold text-ink">
                  {agent.name}
                </Text>
                {waiting ? <Badge variant="warning">Waiting for pairing</Badge> : <Badge variant={online ? 'success' : 'neutral'}>{online ? 'Online' : 'Offline'}</Badge>}
              </View>
              {details !== '' && (
                <Text numberOfLines={1} className="text-sm text-muted">
                  {details}
                </Text>
              )}
            </View>
            <Icon name="ellipsis-horizontal" size={20} />
          </Pressable>
        )}
      />

      {agent.pairing && (
        <View className="mx-4 mb-3 gap-3 rounded-control bg-sunken px-4 py-3">
          <View className="gap-0.5">
            <Text className="text-sm text-muted">{expired ? 'This code has expired.' : 'Type this code into the agent on the PC:'}</Text>
            <Text selectable className="text-2xl font-semibold tracking-widest text-ink">
              {expired ? '------' : agent.pairing.code}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Button variant="outline" size="sm" icon="refresh-outline" onPress={onRefresh}>
              Check again
            </Button>
            {expired && (
              <Button size="sm" onPress={() => void newCode()}>
                New code
              </Button>
            )}
          </View>
        </View>
      )}

      {!waiting && !agent.printers.length && <Text className="px-4 pb-3 text-sm text-muted">The agent has not listed any printers yet.</Text>}
      {agent.printers.map((printer) => (
        <PrinterRow key={printer.systemName} agent={agent} printer={printer} categories={categories} onSaved={onSaved} />
      ))}
    </View>
  );
}
