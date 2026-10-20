import withOverlay from '@/hoc/withOverlay';
import TableQrPanel from './table_qr_panel';

/** `<TableQr table component={({ open }) => …} />` */
const TableQr = withOverlay(TableQrPanel);

export default TableQr;
