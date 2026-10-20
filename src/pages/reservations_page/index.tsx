import { FlatList, RefreshControl, View } from 'react-native';
import { Stack } from 'expo-router';
import Can from '@/components/can';
import EmptyState from '@/components/empty_state';
import FormSheet from '@/components/form_sheet';
import ReservationFields from '@/components/reservation_fields';
import SkeletonList from '@/components/skeleton_list';
import api from '@/config/api';
import RequirePermission from '@/hoc/require_permission';
import useGet from '@/hooks/useGet';
import type Reservation from '@/types/reservation';
import IconButton from '@/ui/icon_button';
import dayKey from '@/utils/day_key';
import pktToIso from '@/utils/pkt_to_iso';
import toast from '@/utils/toast';
import DayBar from './day_bar';
import ReservationRow from './reservation_row';
import reservationSchema from './reservation_schema';

/** Table bookings at the working branch, one day at a time, in time order. */
export default function ReservationsPage() {
  return (
    <RequirePermission permission="reservations:view">
      <ReservationsDay />
    </RequirePermission>
  );
}

function ReservationsDay() {
  const { data: list = [], loading, refreshing, options, get, update } = useGet<Reservation[]>('/reservations', { params: { date: dayKey() } });
  const day: string = options.params.date;
  // A day seen before shows at once; pull down to ask again.
  const setDay = (date: string) => get({ params: { date } }, { reuse: true });
  const reservations = list.filter((reservation) => dayKey(reservation.dateTime) === day).sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  const active = reservations.filter((reservation) => reservation.status !== 'cancelled');
  const guests = active.reduce((sum, reservation) => sum + reservation.partySize, 0);
  const onSaved = (saved: Reservation) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)));

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Can permission="reservations:manage">
              <FormSheet
                key={day}
                title="New reservation"
                schema={reservationSchema}
                defaultValues={{ date: day, time: '20:00', partySize: '4' }}
                submitLabel="Save reservation"
                onSave={(values) =>
                  api.post<Reservation>('/reservations', { ...values, dateTime: pktToIso(values.date, values.time) }).then((res) => {
                    toast.success(`Table booked for ${res.data.customer?.name ?? values.name}`);
                    update((current) => (current ? [res.data, ...current] : [res.data]));
                    if (values.date !== day) setDay(values.date);
                  })
                }
                fields={(form) => <ReservationFields {...form} />}
                component={({ open }) => <IconButton icon="add" variant="soft" label="Add reservation" onPress={open} />}
              />
            </Can>
          ),
        }}
      />
      <FlatList
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-2.5 px-4 pt-2 pb-32"
        data={loading ? [] : reservations}
        keyExtractor={(reservation) => reservation._id}
        renderItem={({ item }) => <ReservationRow reservation={item} onSaved={onSaved} />}
        refreshControl={<RefreshControl refreshing={Boolean(refreshing) && !loading} onRefresh={() => get()} />}
        ListHeaderComponent={
          <View className="pb-2">
            <DayBar day={day} onDay={setDay} summary={`${active.length} ${active.length === 1 ? 'booking' : 'bookings'}, ${guests} guests`} />
          </View>
        }
        ListEmptyComponent={loading ? <SkeletonList rows={4} /> : <EmptyState icon="calendar-outline" title="No reservations this day" text="Add one with + when a guest calls to book a table." />}
      />
    </>
  );
}
