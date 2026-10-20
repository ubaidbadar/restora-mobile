import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import useAuthStore from '@/store/auth_store';
import type Customer from '@/types/customer';
import type KhataEntry from '@/types/khata_entry';
import formatDate from './format_date';
import formatPhone from './format_phone';
import formatRs from './format_rs';
import khataLabel from './khata_label';
import toast from './toast';

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const STYLES = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0F172A; }
  .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
  .brand { font-size: 20px; font-weight: 700; color: #0F172A; }
  .sub { font-size: 13px; color: #64748B; margin-top: 2px; }
  .customer-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; }
  .cust-name { font-size: 17px; font-weight: 700; color: #0F172A; }
  .cust-meta { font-size: 13px; color: #64748B; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { text-align: left; padding: 10px 12px; background: #F1F5F9; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #475569; border-bottom: 1px solid #CBD5E1; }
  td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; }
  .text-right { text-align: right; }
  .debit { color: #DC2626; font-weight: 600; }
  .credit { color: #16A34A; font-weight: 600; }
  .balance-card { display: flex; justify-content: flex-end; margin-top: 12px; }
  .balance-box { background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 24px; text-align: right; }
  .bal-label { font-size: 12px; font-weight: 600; color: #92400E; text-transform: uppercase; }
  .bal-amount { font-size: 22px; font-weight: 800; color: #78350F; margin-top: 2px; }
  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94A3B8; }
`;

/** Generates and shares a PDF Khata statement for a customer. */
export default async function printKhata(
  customer: Customer,
  entries: KhataEntry[]
): Promise<void> {
  try {
    const workplace = useAuthStore.getState().me?.workplace;
    const restName = workplace?.restaurant?.name || 'Restora';
    const branchName = workplace?.branch?.name || '';

    const rows = entries
      .map((entry) => {
        const isDebit = entry.amount > 0;
        return `<tr>
          <td>${formatDate(entry.createdAt)}</td>
          <td>${escape(khataLabel(entry))}</td>
          <td class="text-right ${isDebit ? 'debit' : 'credit'}">
            ${isDebit ? '+' : '-'}${formatRs(Math.abs(entry.amount))}
          </td>
        </tr>`;
      })
      .join('');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Khata Statement - ${escape(customer.name)}</title><style>${STYLES}</style></head>
    <body>
      <div class="header">
        <div>
          <div class="brand">${escape(restName)}</div>
          <div class="sub">${escape(branchName)} · Khata Ledger Statement</div>
        </div>
        <div class="sub">${formatDate(new Date().toISOString())}</div>
      </div>

      <div class="customer-box">
        <div class="cust-name">${escape(customer.name)}</div>
        <div class="cust-meta">${formatPhone(customer.phone)}${customer.area ? ` · ${escape(customer.area)}` : ''}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="3" style="text-align:center;color:#64748B;">No khata transactions</td></tr>'}
        </tbody>
      </table>

      <div class="balance-card">
        <div class="balance-box">
          <div class="bal-label">Outstanding Balance Due</div>
          <div class="bal-amount">${formatRs(customer.khataBalance)}</div>
        </div>
      </div>

      <div class="footer">
        Made with Restora
      </div>
    </body></html>`;

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Khata Statement - ${customer.name}`,
      });
    } else {
      await Print.printAsync({ html });
    }
  } catch {
    toast.error('Could not generate PDF statement');
  }
}
