/** A table of the active branch. Its QR link is /t/<qrCode>: `restaurant/table-key`, or older tables' random code. */
export default interface Table {
  _id: string;
  name: string;
  section?: string;
  seats?: number;
  qrCode: string;
  /** Codes printed before the current one, which still open the table. */
  oldCodes?: string[];
  archived: boolean;
}
