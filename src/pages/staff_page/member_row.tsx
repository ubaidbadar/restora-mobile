import { Pressable, Text, View } from 'react-native';
import can from '@shared/can';
import FormSheet from '@/components/form_sheet';
import api from '@/config/api';
import useAuthStore from '@/store/auth_store';
import type MenuAction from '@/types/menu_action';
import type Role from '@/types/role';
import type StaffMember from '@/types/staff_member';
import Avatar from '@/ui/avatar';
import Badge from '@/ui/badge';
import Icon from '@/ui/icon';
import MenuSheet from '@/ui/menu_sheet';
import confirm from '@/utils/confirm';
import getAxiosMessage from '@/utils/get_axios_message';
import initialsOf from '@/utils/initials_of';
import nameCase from '@/utils/name_case';
import toast from '@/utils/toast';
import AccessFields from './access_fields';
import accessSchema from './access_schema';

interface MemberRowProps {
  member: StaffMember;
  roles: Role[];
  onSaved: (member: StaffMember) => void;
  onRemoved: (id: string) => void;
}

/**
 * One person: name, roles, branches, state. People allowed to change access tap the row for: change access, PIN help,
 * suspend or reactivate, remove. Nobody changes themselves here, and owners are changed only by owners.
 */
export default function MemberRow({ member, roles, onSaved, onRemoved }: MemberRowProps) {
  const me = useAuthStore((state) => state.me);
  const workplace = me?.workplace;
  const isMe = member.userId === me?.user.id;
  const name = nameCase(member.user?.name ?? 'Someone');
  const canManage = can(workplace, 'staff:manage') && !isMe && !member.isPrimaryOwner && (!member.isOwner || Boolean(workplace?.isOwner));
  const roleNames = member.roleIds.flatMap((id) => roles.find((role) => role._id === id)?.name ?? []);
  const branchNames = member.branchIds.flatMap((id) => workplace?.branches.find((branch) => branch._id === id)?.name ?? []);
  const where = member.branchScope === 'all' ? 'All branches' : branchNames.length ? branchNames.join(', ') : 'No branch';

  const post = (path: string, message: string) =>
    api
      .post<StaffMember>(`/members/${member._id}/${path}`)
      .then((res) => {
        onSaved(res.data);
        toast.success(message);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  const ask = async (title: string, message: string, confirmLabel: string, action: () => unknown, destructive = true) => {
    if (await confirm({ title, message, confirmLabel, destructive })) await action();
  };

  const remove = () =>
    api
      .delete(`/members/${member._id}`)
      .then(() => {
        onRemoved(member._id);
        toast.success(`${name} removed`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  const body = (onPress?: () => void) => (
    <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} className="min-h-16 flex-row items-center gap-3 px-4 py-3 active:bg-sunken">
      <Avatar initials={initialsOf(name)} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text numberOfLines={1} className="shrink text-base font-semibold text-ink">
            {name}
          </Text>
          {isMe && <Badge>You</Badge>}
          {member.isPrimaryOwner && <Badge variant="primary">Owner</Badge>}
          {member.status === 'suspended' && <Badge variant="warning">Suspended</Badge>}
          {member.pinLocked && <Badge variant="danger">PIN locked</Badge>}
        </View>
        {member.user?.email && (
          <Text numberOfLines={1} className="text-sm text-muted">
            {member.user.email}
          </Text>
        )}
        <Text numberOfLines={2} className="text-sm text-body">
          {roleNames.join(', ')} · {where}
        </Text>
      </View>
      {onPress && <Icon name="ellipsis-horizontal" size={20} />}
    </Pressable>
  );

  if (!canManage) return body();

  return (
    <FormSheet
      title={`${name}'s access`}
      schema={accessSchema}
      defaultValues={{ roleIds: member.roleIds, branchScope: member.branchScope, branchIds: member.branchIds }}
      onSave={(values) =>
        api.patch<StaffMember>(`/members/${member._id}`, values).then((res) => {
          onSaved(res.data);
          toast.success(`${name}'s access changed. It applies straight away.`);
        })
      }
      fields={(form) => <AccessFields {...form} roles={roles} />}
      component={({ open: edit }) => {
        const suspended = member.status === 'suspended';
        const actions: MenuAction[] = [
          { label: 'Change roles and branches', icon: 'create-outline', symbol: 'square.and.pencil', onPress: edit },
          { label: 'Unlock POS PIN', icon: 'lock-open-outline', symbol: 'lock.open', onPress: () => void post('unlock-pin', `${name}'s PIN works again`), hidden: !member.pinLocked },
          { label: 'Clear POS PIN', icon: 'key-outline', symbol: 'key', onPress: () => void post('clear-pin', `${name}'s PIN cleared. They can set a new one.`), hidden: !member.hasPin },
          suspended
            ? { label: 'Reactivate', icon: 'person-outline', symbol: 'person.badge.plus', onPress: () => void ask(`Let ${name} work again?`, 'They get back the roles and branches they had.', 'Reactivate', () => post('activate', `${name} can work again`), false) }
            : {
                label: 'Suspend',
                icon: 'pause-circle-outline',
                symbol: 'pause.circle',
                onPress: () => void ask(`Suspend ${name}?`, 'They are signed out of this restaurant at once and cannot work until you reactivate them. Their roles, PIN and history are kept.', 'Suspend', () => post('suspend', `${name} is suspended`)),
              },
          { label: 'Remove', icon: 'trash-outline', symbol: 'trash', destructive: true, onPress: () => void ask(`Remove ${name}?`, 'They can no longer work here. Orders they took keep their name. To bring them back, invite them again.', 'Remove', remove) },
        ];
        return <MenuSheet title={name} items={actions} component={({ open }) => body(open)} />;
      }}
    />
  );
}
