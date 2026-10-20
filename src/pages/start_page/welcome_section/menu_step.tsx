import { useState } from 'react';
import { View } from 'react-native';
import AuthCard from '@/components/auth_card';
import api from '@/config/api';
import SAMPLE_MENU from '@/constants/sample_menu';
import Button from '@/ui/button';
import getAxiosMessage from '@/utils/get_axios_message';
import toast from '@/utils/toast';
import MenuChoice from './menu_choice';

interface MenuStepProps {
  onBack: () => void;
  onFinish: () => void;
}

const CATEGORIES = [...new Set(SAMPLE_MENU.items.map((dish) => dish.category))];

/** Setup step 3: start with the sample dishes or an empty menu; either one opens the app. */
export default function MenuStep({ onBack, onFinish }: MenuStepProps) {
  const [busy, setBusy] = useState(false);

  const finish = (withSamples: boolean) => {
    setBusy(true);
    (withSamples ? api.post('/menu/bulk', SAMPLE_MENU) : Promise.resolve())
      .then(onFinish)
      .catch((err) => {
        setBusy(false);
        toast.error(getAxiosMessage(err));
      });
  };

  return (
    <AuthCard title="Start your menu" subtitle="Step 3 of 3 · Begin with sample dishes to try an order right away, or add your own.">
      <View className="gap-3">
        <MenuChoice
          title={`${SAMPLE_MENU.items.length} sample dishes`}
          description="With half/full sizes, extras and spice levels, so you can try an order straight away. Edit or delete them later."
          tags={CATEGORIES}
          recommended
          disabled={busy}
          onPress={() => finish(true)}
        />
        <MenuChoice title="An empty menu" description="Add your own dishes one by one from More → Menu." disabled={busy} onPress={() => finish(false)} />
        <Button variant="ghost" disabled={busy} onPress={onBack} className="self-start">
          Back
        </Button>
      </View>
    </AuthCard>
  );
}
