
/** `pending`: a guest sent it from the table's QR page; staff accept it (it becomes `new`) or turn it down (cancel). */
type OrderStatus = 'pending' | 'new' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';

export default OrderStatus;
