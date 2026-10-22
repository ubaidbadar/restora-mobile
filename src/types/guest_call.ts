/** A guest's call from a table's QR page, as the live stream sends it (`call.created`, `call.updated`). */
export default interface GuestCall {
  _id: string;
  tableId: string;
  tableName?: string;
  type: 'waiter' | 'bill';
  resolved: boolean;
  createdAt: string;
}
