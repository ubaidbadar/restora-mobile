import withOverlay from '@/hoc/withOverlay';
import FormSheetPanel from './form_sheet_panel';

/** `<FormSheet title schema fields onSave component={({ open }) => <Button onPress={open}>Add</Button>} />` */
const FormSheet = withOverlay(FormSheetPanel);

export default FormSheet;
