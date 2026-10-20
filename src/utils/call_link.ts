/** A `tel:` link for a saved number, digits and + only. */
const callLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export default callLink;
