import type ParsedSheet from '@/types/parsed_sheet';

/** Parse copied CSV or TSV with quoted cells, escaped quotes and newlines. Rows are never sent until reviewed. */
export default function parseCustomerCsv(source: string): ParsedSheet {
  const input = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!input.trim()) throw new Error('Paste a CSV or spreadsheet selection with column titles first.');
  const delimiter = input.split('\n', 1)[0]!.includes('\t') ? '\t' : ',';
  const table: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i]!;
    if (c === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && c === delimiter) {
      row.push(cell);
      cell = '';
    } else if (!quoted && c === '\n') {
      row.push(cell);
      if (row.some((part) => part.trim())) table.push(row);
      row = [];
      cell = '';
    } else {
      cell += c;
    }
  }
  if (quoted) throw new Error('The pasted CSV contains an unfinished quoted value.');
  row.push(cell);
  if (row.some((part) => part.trim())) table.push(row);
  const [headers, ...rows] = table;
  if (!headers || !rows.length) throw new Error('Include a header row and at least one customer.');
  if (rows.length > 2_000) throw new Error('Import up to 2,000 customers at a time.');
  return {
    fileName: 'Pasted customer list',
    headers: headers.map((value, index) => value.trim() || `Column ${index + 1}`),
    rows,
  };
}
