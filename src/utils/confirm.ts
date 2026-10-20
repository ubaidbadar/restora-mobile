import { Alert } from 'react-native';

interface ConfirmOptions {
  title: string;
  message?: string;
  /** The action's button, e.g. "Cancel order". */
  confirmLabel: string;
  /** Red, for what can't be undone. */
  destructive?: boolean;
}

/** The platform's alert with "Keep" and the action. Resolves `true` when they confirm. */
export default function confirm({ title, message, confirmLabel, destructive = false }: ConfirmOptions) {
  return new Promise<boolean>((resolve) =>
    Alert.alert(
      title,
      message,
      [
        { text: 'Keep', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    )
  );
}
