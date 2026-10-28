import { Pressable, Text, View } from 'react-native';
import FormSheet from '@/components/form_sheet';
import api from '@/config/api';
import type MenuCategory from '@/types/menu_category';
import type PrintAgent from '@/types/print_agent';
import type Printer from '@/types/printer';
import Badge from '@/ui/badge';
import Icon from '@/ui/icon';
import toast from '@/utils/toast';
import PrinterFields from './printer_fields';
import printerSchema from './printer_schema';

interface PrinterRowProps {
  agent: PrintAgent;
  printer: Printer;
  categories: MenuCategory[];
  onSaved: (agent: PrintAgent) => void;
}

/** One printer of a PC, what it prints told in words ("Kitchen slips (Drinks) · 80 mm"). Tap to change it. */
export default function PrinterRow({ agent, printer, categories, onSaved }: PrinterRowProps) {
  const names = categories.filter((category) => printer.categoryIds.includes(category._id)).map((category) => category.name);
  const summary = [
    printer.prints.includes('kitchen') && `Kitchen slips${names.length ? ` (${names.join(', ')})` : ''}`,
    printer.prints.includes('receipt') && 'Receipts',
    !printer.prints.length && 'Not used yet',
    printer.width === 48 ? '80 mm' : '58 mm',
    printer.copies > 1 && `${printer.copies} copies`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <FormSheet
      title={`Edit ${printer.label}`}
      schema={printerSchema}
      defaultValues={{ label: printer.label, prints: printer.prints, categoryIds: printer.categoryIds, width: String(printer.width), copies: String(printer.copies) }}
      onSave={(values) =>
        api.patch<PrintAgent>(`/print-agents/${agent._id}/printers/${encodeURIComponent(printer.systemName)}`, values).then((res) => {
          onSaved(res.data);
          toast.success('Printer saved');
        })
      }
      fields={(form) => <PrinterFields {...form} categories={categories} />}
      component={({ open }) => (
        <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${printer.label}`} onPress={open} className="min-h-14 flex-row items-center gap-3 border-t border-border px-4 py-3 active:bg-sunken">
          <Icon name="print-outline" size={20} />
          <View className="flex-1 gap-0.5">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Text numberOfLines={1} className="shrink text-base font-medium text-ink">
                {printer.label}
              </Text>
              {!printer.present && <Badge variant="warning">Not found</Badge>}
            </View>
            <Text numberOfLines={1} className="text-sm text-muted">
              {printer.systemName}
            </Text>
            <Text numberOfLines={2} className="text-sm text-body">
              {summary}
            </Text>
          </View>
          <Icon name="chevron-forward" size={18} />
        </Pressable>
      )}
    />
  );
}
