import WEB_URL from '@/constants/web_url';

/** The address a table's QR code opens: the guest menu of that table, on the web app. */
const tableLink = (code: string) => `${WEB_URL}/t/${code}`;

export default tableLink;
