import withOverlay from '@/hoc/withOverlay';
import CustomerPicker from './customer_picker';

/** The customer picker as a page sheet with its own open state. */
const CustomerStepPicker = withOverlay(CustomerPicker);

export default CustomerStepPicker;
