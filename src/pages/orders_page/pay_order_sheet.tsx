import withOverlay from '@/hoc/withOverlay';
import PayOrderPanel from './pay_order_panel';

/** `<PayOrderSheet order onOrderUpdated component={({ open }) => …} />` */
const PayOrderSheet = withOverlay(PayOrderPanel);

export default PayOrderSheet;
