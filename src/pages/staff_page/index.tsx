import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import Can from '@/components/can';
import FormSheet from '@/components/form_sheet';
import SkeletonList from '@/components/skeleton_list';
import api from '@/config/api';
import RequirePermission from '@/hoc/require_permission';
import useGet from '@/hooks/useGet';
import type Invitation from '@/types/invitation';
import type Role from '@/types/role';
import type StaffMember from '@/types/staff_member';
import IconButton from '@/ui/icon_button';
import InvitationRow from './invitation_row';
import inviteToast from './invite_toast';
import InviteFields from './invite_fields';
import inviteSchema from './invite_schema';
import MemberRow from './member_row';

/** Who works here and who has been invited. Roles are loaded once here and shared by both lists. */
export default function StaffPage() {
  return (
    <RequirePermission permission="staff:view">
      <StaffLists />
    </RequirePermission>
  );
}

function StaffLists() {
  const { data: roles = [] } = useGet<Role[]>('/roles');
  const { data: members = [], loading, refreshing, get, update } = useGet<StaffMember[]>('/members');
  const { data: invitations = [], update: updateInvitations } = useGet<Invitation[]>('/invitations');

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Can permission="staff:invite">
              <FormSheet
                title="Invite someone"
                schema={inviteSchema}
                defaultValues={{ channel: 'email', branchScope: 'all', roleIds: [], branchIds: [] }}
                submitLabel="Send invitation"
                busyLabel="Sending…"
                onSave={(values) =>
                  api.post<Invitation & { inviteUrl: string }>('/invitations', values).then((res) => {
                    inviteToast(String(values.name || values.email || values.phone), res.data);
                    // Inviting the same person again replaces their earlier invitation.
                    updateInvitations((current) => [res.data, ...(current ?? []).filter((item) => item.status !== 'pending' || (item.email ?? item.phone) !== (res.data.email ?? res.data.phone))]);
                  })
                }
                fields={(form) => <InviteFields {...form} roles={roles} />}
                component={({ open }) => <IconButton icon="person-add-outline" variant="soft" label="Invite someone" onPress={open} />}
              />
            </Can>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-6 px-4 pt-2 pb-32" refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}>
        <View className="gap-2">
          <Text className="text-sm text-muted">Everyone signs in with their own account. Roles decide what they can do; branches decide where.</Text>
          {loading ? (
            <SkeletonList rows={4} />
          ) : (
            <View className="overflow-hidden rounded-card border border-border bg-surface">
              {members.map((member, index) => (
                <View key={member._id} className={index ? 'border-t border-border' : ''}>
                  <MemberRow
                    member={member}
                    roles={roles}
                    onSaved={(saved) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)))}
                    onRemoved={(id) => update((current) => current?.filter((item) => item._id !== id))}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
        <View className="gap-2">
          <Text accessibilityRole="header" className="text-heading font-semibold text-ink">
            Invitations
          </Text>
          <Text className="text-sm text-muted">A link works for 7 days.</Text>
          {invitations.length ? (
            <View className="overflow-hidden rounded-card border border-border bg-surface">
              {invitations.map((invitation, index) => (
                <View key={invitation._id} className={index ? 'border-t border-border' : ''}>
                  <InvitationRow invitation={invitation} onChanged={(saved) => updateInvitations((current) => current?.map((item) => (item._id === saved._id ? saved : item)))} />
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted">No open invitations.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}
