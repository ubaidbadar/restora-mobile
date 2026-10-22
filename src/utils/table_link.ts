import SITE_URL from '@/constants/site_url';

/** The address a table's QR code opens: the guest menu of that table, on the public site. Printed codes keep it for good. */
const tableLink = (code: string) => `${SITE_URL}/t/${code}`;

export default tableLink;
