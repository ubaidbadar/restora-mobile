import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import EmptyState from '@/components/empty_state';
import type FloorTable from '@/types/floor_table';
import Tabs from '@/ui/tabs';
import CallsStrip from './calls_strip';
import TableTile from './table_tile';

type Show = 'all' | 'busy' | 'free';

/** Busy: someone is eating there or called. Free: nobody is (a table only booked for later still counts as free). */
const isBusy = (table: FloorTable) => table.orders.length > 0 || table.requests.length > 0;

interface TablesViewProps {
  /** The page title, first in the scroll view. */
  header: ReactNode;
  /** Every table of the branch, archived ones too. */
  all: FloorTable[];
  refreshing: boolean;
  onRefresh: () => void;
  onAnswer: (requestId: string) => void;
}

/** The tables by section, narrowed by the chips (All, Busy, Free), kept in the route's params. */
export default function TablesView({ header, all, refreshing, onRefresh, onAnswer }: TablesViewProps) {
  const width = useWindowDimensions().width;
  const { show = 'all' } = useLocalSearchParams<{ show?: Show }>();
  // T1, T2 … T10, T11: numbers in names in number order.
  const tables = all.filter((table) => !table.archived).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const busy = tables.filter(isBusy);
  const shown = show === 'busy' ? busy : show === 'free' ? tables.filter((table) => !isBusy(table)) : tables;
  const sections = [...new Set(shown.map((table) => table.section ?? ''))];
  // Tiles at least 100 wide, filling the row: three across on a phone.
  const columns = Math.max(3, Math.floor((Math.min(width, 1200) - 32 + 10) / 110));
  const tileWidth = (Math.min(width, 1200) - 32 - 10 * (columns - 1)) / columns;
  const options: { value: Show; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: tables.length },
    { value: 'busy', label: 'Busy', count: busy.length },
    { value: 'free', label: 'Free', count: tables.length - busy.length },
  ];

  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 px-4 pb-32" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {header}
      {!tables.length ? (
        <EmptyState icon="grid-outline" title="No tables in this branch" text="Each table gets a QR code: guests scan it to see the menu and call a waiter. A manager adds tables on the web." />
      ) : (
        <>
          <CallsStrip tables={tables} onAnswer={onAnswer} />
          <Tabs scroll className="-mx-4" options={options} value={show} onChange={(value) => router.setParams({ show: value })} />
          {!shown.length && (
            <EmptyState
              icon={show === 'busy' ? 'cafe-outline' : 'restaurant-outline'}
              title={show === 'busy' ? 'No busy tables right now' : 'Every table is busy'}
              text={show === 'busy' ? 'Tables with guests eating or calling show here.' : 'Tables free for new guests show here.'}
            />
          )}
          {sections.map((section) => (
            <View key={section} className="gap-2">
              {sections.length > 1 && <Text className="text-heading font-semibold text-ink">{section || 'Other tables'}</Text>}
              <View className="flex-row flex-wrap gap-2.5">
                {shown
                  .filter((table) => (table.section ?? '') === section)
                  .map((table) => (
                    <TableTile key={table._id} table={table} width={tileWidth} onAnswer={onAnswer} />
                  ))}
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
