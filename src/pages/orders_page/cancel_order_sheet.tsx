import withOverlay from '@/hoc/withOverlay';
import CancelOrderPanel from './cancel_order_panel';

/** `<CancelOrderSheet order onCancel component={({ open }) => …} />` */
const CancelOrderSheet = withOverlay(CancelOrderPanel);

export default CancelOrderSheet;
