import { useState } from 'react';
import type InputProps from '@/types/input_props';
import IconButton from './icon_button';
import Input from './input';

/** A password field with a show/hide button. */
export default function PasswordInput(props: InputProps) {
  const [shown, setShown] = useState(false);
  return (
    <Input
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!shown}
      trailing={<IconButton icon={shown ? 'eye-off-outline' : 'eye-outline'} label={shown ? 'Hide password' : 'Show password'} size="sm" className="me-1.5" onPress={() => setShown(!shown)} />}
    />
  );
}
