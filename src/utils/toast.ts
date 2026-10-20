import * as Haptics from 'expo-haptics';
import { AccessibilityInfo } from 'react-native';
import useToastStore from '@/store/toast_store';
import type ToastAction from '@/types/toast_action';
import type ToastType from '@/types/toast_type';

const FEEDBACK: Record<ToastType, Haptics.NotificationFeedbackType | null> = {
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  warning: Haptics.NotificationFeedbackType.Warning,
  info: null,
};

/** Shows the snackbar, with the haptic that says how it went, and reads it out to screen readers. */
const show = (message: string, type: ToastType, action?: ToastAction) => {
  const feedback = FEEDBACK[type];
  if (feedback) void Haptics.notificationAsync(feedback);
  AccessibilityInfo.announceForAccessibility(message);
  useToastStore.getState().show(message, type, action);
};

/** `toast.success('Saved')`, `toast.info('Deleted', { label: 'Undo', onClick })`: the snackbar at the bottom. */
const toast = {
  success: (message: string, action?: ToastAction) => show(message, 'success', action),
  error: (message: string, action?: ToastAction) => show(message, 'error', action),
  warning: (message: string, action?: ToastAction) => show(message, 'warning', action),
  info: (message: string, action?: ToastAction) => show(message, 'info', action),
};

export default toast;
