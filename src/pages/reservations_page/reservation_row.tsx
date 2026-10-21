import { Pressable, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import can from '@shared/can';
import FormSheet from '@/components/form_sheet';
import ReservationFields from '@/components/reservation_fields';
import api from '@/config/api';
import RESERVATION_STATUS_LABELS from '@/constants/reservation_status_labels';
import useAuthStore from '@/store/auth_store';
import type MenuAction from '@/types/menu_action';
import type Reservation from '@/types/reservation';
import Badge from '@/ui/badge';
import Icon from '@/ui/icon';
import MenuSheet from '@/ui/menu_sheet';
import confirm from '@/utils/confirm';
import dayKey from '@/utils/day_key';
import fillTemplate from '@/utils/fill_template';
import formatDay from '@/utils/format_day';
import formatTime from '@/utils/format_time';
import getAxiosMessage from '@/utils/get_axios_message';
import nameCase from '@/utils/name_case';
import pktToIso from '@/utils/pkt_to_iso';
import toast from '@/utils/toast';
import waLink from '@/utils/wa_link';
import reservationEditSchema from './reservation_edit_schema';

interface ReservationRowProps {
  reservation: Reservation;
  onSaved: (reservation: Reservation) => void;
}

const BADGES = { pending: 'warning', confirmed: 'success', seated: 'neutral', cancelled: 'danger' } as const;

/**
 * One booking: time, guest, how many, status, note. Tap it (or ⋯) for what can be done while it is still open: confirm
 * on WhatsApp, mark confirmed or seated, change it, cancel it.
 */
export default function ReservationRow({ reservation, onSaved }: ReservationRowProps) {
  const workplace = useAuthStore((state) => state.me?.workplace);
  const settings = workplace?.settings;
  const name = nameCase(reservation.customer?.name ?? 'Guest');
  const phone = reservation.customer?.phone;
  const pending = reservation.status === 'pending';
  const open = (pending || reservation.status === 'confirmed') && can(workplace, 'reservations:manage');
  // The HH:mm wall-clock time in PKT, for the edit form.
  const editTime = new Date(new Date(reservation.dateTime).getTime() + 5 * 3_600_000).toISOString().slice(11, 16);

  const setStatus = (status: 'confirmed' | 'seated' | 'cancelled', message: string) =>
    api
      .patch<Reservation>(`/reservations/${reservation._id}`, { status })
      .then((res) => {
        onSaved(res.data);
        toast.success(message);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  const whatsapp = () => {
    const text = fillTemplate(settings?.whatsappTemplates.reservation ?? '', {
      name,
      date: formatDay(reservation.dateTime),
      time: formatTime(reservation.dateTime),
      party: reservation.partySize,
      restaurant: workplace?.restaurant.name ?? '',
    });
    void Linking.openURL(waLink(phone!, text));
  };

  const cancel = async () => {
    const ok = await confirm({
      title: `Cancel ${name}'s booking?`,
      message: `${reservation.partySize} people at ${formatTime(reservation.dateTime)}. The booking stays on the day as cancelled.`,
      confirmLabel: 'Cancel booking',
      destructive: true,
    });
    if (ok) void setStatus('cancelled', `${name}'s booking cancelled`);
  };

  const body = (onPress?: () => void) => (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={onPress ? 'Shows what you can do with this booking' : undefined}
      disabled={!onPress}
      onPress={onPress}
      className="flex-row gap-3 rounded-card border border-border bg-surface p-3.5 active:bg-sunken"
    >
      <Text className="w-20 border-e border-border pe-3 text-heading font-semibold text-ink">{formatTime(reservation.dateTime)}</Text>
      <View className="flex-1 gap-1">
        <Text numberOfLines={1} className="text-base font-semibold text-ink">
          {name}
        </Text>
        <View className="flex-row flex-wrap items-center gap-2">
          <View className="flex-row items-center gap-1">
            <Icon name="people-outline" size={15} />
            <Text className="text-sm text-muted">{reservation.partySize} people</Text>
          </View>
          <Badge variant={BADGES[reservation.status]}>{RESERVATION_STATUS_LABELS[reservation.status]}</Badge>
        </View>
        {reservation.note && <Text className="text-sm text-body">{reservation.note}</Text>}
      </View>
      {onPress && <Icon name="ellipsis-horizontal" size={20} />}
    </Pressable>
  );

  if (!open) return body();

  return (
    <FormSheet
      title={`Edit booking for ${name}`}
      schema={reservationEditSchema}
      defaultValues={{ partySize: String(reservation.partySize), date: dayKey(reservation.dateTime), time: editTime, note: reservation.note ?? '', tableId: reservation.tableId ?? '' }}
      onSave={({ date, time, partySize, note, tableId }) =>
        api.patch<Reservation>(`/reservations/${reservation._id}`, { partySize, note, tableId, dateTime: pktToIso(date, time) }).then((res) => {
          onSaved(res.data);
          toast.success(`${name}'s booking moved to ${formatDay(pktToIso(date, time))}, ${formatTime(pktToIso(date, time))}`);
        })
      }
      fields={(form) => <ReservationFields {...form} editing />}
      component={({ open: edit }) => {
        const actions: MenuAction[] = [
          { label: 'Confirm on WhatsApp', icon: 'logo-whatsapp', symbol: 'message', onPress: whatsapp, hidden: !pending || !phone },
          { label: 'Mark confirmed', icon: 'checkmark-circle-outline', symbol: 'checkmark.circle', onPress: () => void setStatus('confirmed', `${name}'s booking confirmed`), hidden: !pending },
          { label: 'Mark seated', icon: 'restaurant-outline', symbol: 'fork.knife', onPress: () => void setStatus('seated', `${name} seated`) },
          { label: 'Change booking', icon: 'create-outline', symbol: 'square.and.pencil', onPress: edit },
          { label: 'Cancel booking', icon: 'close-circle-outline', symbol: 'xmark.circle', onPress: () => void cancel(), destructive: true },
        ];
        return <MenuSheet title={`${name} · ${formatTime(reservation.dateTime)}`} items={actions} component={({ open: openMenu }) => body(openMenu)} />;
      }}
    />
  );
}
