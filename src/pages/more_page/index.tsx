import Constants from 'expo-constants';
import can from '@shared/can';
import useAuthStore from '@/store/auth_store';
import { ScrollView, Text } from 'react-native';
import PageHeader from '@/components/page_header';
import TabScreen from '@/components/tab_screen';
import AccountCard from './account_card';
import AppearanceSection from './appearance_section';
import DeleteAccountButton from './delete_account_button';
import ManageSection from './manage_section';
import MoreSection from './more_section';
import PagesSection from './pages_section';
import SignOutButton from './sign_out_button';
import SoundRow from './sound_row';
import SyncSection from './sync_section';
import WebSection from './web_section';
import WorkplaceSection from './workplace_section';

/** Who you are and where you work, the new-order chime, offline sync, appearance, the web app, and signing out. */
export default function MorePage() {
  return (
    <TabScreen>
      <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-6 px-4 pb-32">
        <PageHeader title="More" />
      <AccountCard />
      <PagesSection />
      <ManageSection />
      <MoreSection title="Working at">
        <WorkplaceSection />
      </MoreSection>
      <MoreSection title="Alerts">
        <SoundRow />
      </MoreSection>
      <MoreSection title="Offline">
        <SyncSection />
      </MoreSection>
      <MoreSection title="Appearance">
        <AppearanceSection />
      </MoreSection>
      {can(useAuthStore.getState().me?.workplace, 'settings:manage') && (
        <MoreSection title="Restora on the web">
          <WebSection />
        </MoreSection>
      )}
      <SignOutButton />
      <DeleteAccountButton />
      <Text className="text-center text-xs text-muted">Restora {Constants.expoConfig?.version}</Text>
      </ScrollView>
    </TabScreen>
  );
}
