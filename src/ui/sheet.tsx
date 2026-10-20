import withOverlay from '@/hoc/withOverlay';
import SheetPanel from './sheet_panel';

/** `<Sheet title="Pay" component={({ open }) => <Button onPress={open}>Pay</Button>}>{({ close }) => …}</Sheet>` */
const Sheet = withOverlay(SheetPanel);

export default Sheet;
