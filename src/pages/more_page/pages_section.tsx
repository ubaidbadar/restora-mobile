import { router } from 'expo-router';
import useAuthStore from '@/store/auth_store';
import splitTabLinks from '@/utils/split_tab_links';
import MoreRow from './more_row';
import MoreSection from './more_section';

/** The tabs that did not fit in the bottom bar. */
export default function PagesSection() {
  const workplace = useAuthStore((state) => state.me?.workplace);
  const { inMore } = splitTabLinks(workplace);
  if (!inMore.length) return null;

  return (
    <MoreSection title="Pages">
      {inMore.map((link, index) => (
        <MoreRow key={link.name} first={index === 0} icon={link.icon} label={link.label} onPress={() => router.navigate(link.href)} />
      ))}
    </MoreSection>
  );
}
