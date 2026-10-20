import type ToastAction from './toast_action';
import type ToastMessage from './toast_message';
import type ToastType from './toast_type';

export default interface ToastState {
  /** The snackbar on screen: one at a time, a new one replaces it. */
  toast: ToastMessage | null;
  show: (message: string, type: ToastType, action?: ToastAction) => void;
  dismiss: (id: string) => void;
}
