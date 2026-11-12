import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import api from '@/config/api';
import IMPORT_FIELDS from '@/constants/import_fields';
import WEB_URL from '@/constants/web_url';
import RequirePermission from '@/hoc/require_permission';
import type ImportAnswer from '@/types/import_answer';
import type ParsedSheet from '@/types/parsed_sheet';
import Button from '@/ui/button';
import Form from '@/ui/form';
import Input from '@/ui/input';
import Select from '@/ui/select';
import formatRs from '@/utils/format_rs';
import importRows from '@/utils/import_rows';
import normalizePhone from '@/utils/normalize_phone';
import toast from '@/utils/toast';
import importSchema from './import_schema';
import parseCustomerCsv from './parse_customer_csv';

const EXISTING = [
  { value: 'skip', label: 'Leave saved customers unchanged' },
  { value: 'fill', label: 'Fill missing details for existing customers' },
];

function ImportMapping({ sheet, onDone, onBack }: { sheet: ParsedSheet; onDone: (result: ImportAnswer) => void; onBack: () => void }) {
  const used = new Set<number>();
  const guess = Object.fromEntries(IMPORT_FIELDS.map((field) => {
    const index = sheet.headers.findIndex((header, at) => !used.has(at) && field.hints.some((hint) => header.toLowerCase().includes(hint)));
    if (index >= 0) used.add(index);
    return [field.key, index >= 0 ? String(index) : ''];
  }));
  const columns = [{ value: '', label: 'Not in the list' }, ...sheet.headers.map((header, index) => ({ value: String(index), label: header }))];

  return (
    <Form
      schema={importSchema}
      defaultValues={{ ...guess, onExisting: 'skip' }}
      className="gap-4"
      onSubmit={({ data, onSuccess, onError }) => {
        const { onExisting, ...mapping } = data;
        const customers = importRows(sheet.rows, mapping);
        api.post<ImportAnswer>('/customers/import', { customers, onExisting }).then((res) => {
          onSuccess('');
          onDone(res.data);
        }).catch(onError);
      }}
      component={(form) => {
        const mapping = form.watch() as Record<string, string>;
        const rows = importRows(sheet.rows, mapping);
        const usable = rows.filter((row) => row.name && row.phone && normalizePhone(row.phone)).length;
        return (
          <>
            <View className="gap-2 rounded-card border border-border bg-surface p-4">
              <Text accessibilityRole="header" className="text-heading font-semibold text-ink">Map columns · {sheet.rows.length} rows</Text>
              <Text className="text-sm text-muted">Pick the source column for each customer detail. Each row keeps its original order for import errors.</Text>
              {IMPORT_FIELDS.map((field) => (
                <Select key={field.key} label={field.label} required={field.required} options={columns} {...form.register(field.key)}
                  error={form.errors[field.key]?.message?.toString()} />
              ))}
              <Select label="Customers already saved" options={EXISTING} {...form.register('onExisting')} />
            </View>
            <View className="gap-2 rounded-card border border-border bg-surface p-4">
              <Text accessibilityRole="header" className="text-heading font-semibold text-ink">Preview</Text>
              <Text className="text-sm text-muted">{usable} of {rows.length} rows have a name and a valid mobile number.</Text>
              {rows.slice(0, 5).map((row, index) => (
                <View key={index} className="gap-1 border-t border-border pt-2">
                  <Text className="text-sm font-medium text-ink">{index + 1}. {row.name || 'No name'}</Text>
                  <Text className="text-sm text-muted">{row.phone || 'No phone'}{row.area ? ` · ${row.area}` : ''}{row.openingKhata ? ` · ${formatRs(row.openingKhata)} khata` : ''}</Text>
                </View>
              ))}
            </View>
            {!!form.error && <Text className="text-sm text-danger-700">{form.error}</Text>}
            <View className="flex-row gap-2">
              <Button variant="outline" onPress={onBack}>Back</Button>
              <Button disabled={form.loading} onPress={form.onSubmit}>{form.loading ? 'Importing…' : `Import ${sheet.rows.length} rows`}</Button>
            </View>
          </>
        );
      }}
    />
  );
}

function ImportScreen() {
  const [step, setStep] = useState<{ source: string; sheet?: ParsedSheet; result?: ImportAnswer }>({ source: '' });

  const preview = () => {
    try { setStep((current) => ({ ...current, sheet: parseCustomerCsv(current.source), result: undefined })); }
    catch (error) { toast.error((error as Error).message); }
  };

  return (
    <ScrollView className="flex-1 bg-canvas" keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 px-4 pt-4 pb-32">
      {step.result ? (
        <View className="gap-4 rounded-card border border-border bg-surface p-4">
          <Text accessibilityRole="header" className="text-heading font-semibold text-ink">Import finished</Text>
          <Text className="text-base text-ink">{step.result.added} added{step.result.filled ? `, ${step.result.filled} updated` : ''}{step.result.skipped.length ? `, ${step.result.skipped.length} skipped` : ''}</Text>
          {step.result.skipped.map((row) => <Text key={row.row} className="text-sm text-body">Row {row.row}: {row.reason}</Text>)}
          <Text className="text-sm text-muted">Pull down on Customers to see imported records; the import API returns counts, not customer IDs.</Text>
          <Button variant="outline" onPress={() => setStep({ source: '' })}>Import another list</Button>
          <Button onPress={() => router.replace('/customers')}>See customers</Button>
        </View>
      ) : step.sheet ? (
        <ImportMapping sheet={step.sheet} onDone={(result) => setStep((current) => ({ ...current, result }))} onBack={() => setStep((current) => ({ ...current, sheet: undefined }))} />
      ) : (
        <View className="gap-4 rounded-card border border-border bg-surface p-4">
          <Text accessibilityRole="header" className="text-heading font-semibold text-ink">Import customers</Text>
          <Text className="text-sm text-body">Copy CSV or a selection from Excel/Google Sheets, with titles like Name and Mobile on the first row. Up to 2,000 customers at once.</Text>
          <Input label="Customer list (CSV or copied spreadsheet)" multiline numberOfLines={8} value={step.source}
            onChangeText={(source) => setStep((current) => ({ ...current, source }))}
            placeholder="Name,Mobile,Area\nAyesha,03001234567,Gulberg" />
          <Button variant="outline" icon="clipboard-outline" onPress={() => void Clipboard.getStringAsync().then((source) => setStep((current) => ({ ...current, source })))}>Paste clipboard</Button>
          <Button disabled={!step.source.trim()} onPress={preview}>Review columns</Button>
          <Text className="text-sm text-muted">For direct .xlsx/.csv file selection or phone contacts, use the web importer until a native file/contacts picker is installed.</Text>
          <Button variant="outline" icon="open-outline" onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/customers/import`)}>Import file or contacts on web</Button>
        </View>
      )}
    </ScrollView>
  );
}

/** Native pasted-list import; identical backend validation and mapping to the web importer. */
export default function CustomersImportPage() {
  return <RequirePermission permission="customers:import"><ImportScreen /></RequirePermission>;
}
