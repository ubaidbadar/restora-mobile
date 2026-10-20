import type ToastState from '@/types/toast_state';
import createStore from './create_store';

const DURATION = 4000;
// Long enough to read the message and reach the button.
const ACTION_DURATION = 7000;
let timer: ReturnType<typeof setTimeout> | undefined;
let lastId = 0;

/** The snackbar on screen (components/snackbar) and the actions that show and hide it. Call it through `utils/toast`. */
const useToastStore = createStore<ToastState>((set, get) => ({
  toast: null,
  show(message, type, action) {
    const id = `toast-${++lastId}`;
    clearTimeout(timer);
    set({ toast: { id, type, message, action } });
    timer = setTimeout(() => get().dismiss(id), action ? ACTION_DURATION : DURATION);
  },
  dismiss(id) {
    if (get().toast?.id !== id) return;
    clearTimeout(timer);
    set({ toast: null });
  },
}));

export default useToastStore;
