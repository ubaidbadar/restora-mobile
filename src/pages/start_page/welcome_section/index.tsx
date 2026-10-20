import { useState } from 'react';
import type RestaurantSettings from '@shared/restaurant_settings';
import useAuthStore from '@/store/auth_store';
import MenuStep from './menu_step';
import TaxStep from './tax_step';

/**
 * The owner's first-run setup, after creating the restaurant: tax, then the menu. The saved tax waits here until the
 * menu step is done, because putting it in the store opens the app.
 */
export default function WelcomeSection() {
  const [step, setStep] = useState<{ saved?: RestaurantSettings }>({});

  if (!step.saved) return <TaxStep onSaved={(saved) => setStep({ saved })} />;
  return <MenuStep onBack={() => setStep({})} onFinish={() => useAuthStore.getState().setSettings(step.saved!)} />;
}
