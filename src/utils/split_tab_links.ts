import can from '@shared/can';
import type Workplace from '@shared/workplace';
import TAB_LINKS from '@/constants/tab_links';

/** The tabs this person may open: the first three go in the bottom bar, the rest are rows in More. */
const splitTabLinks = (workplace: Workplace | null | undefined) => {
  const allowed = TAB_LINKS.filter((link) => can(workplace, link.permission));
  return { inBar: allowed.slice(0, 3), inMore: allowed.slice(3) };
};

export default splitTabLinks;
