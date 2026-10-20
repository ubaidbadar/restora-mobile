/**
 * The digits of a mobile number without its country or trunk prefix, so "0300-1234567", "+923001234567" and a second
 * number saved as typed all compare alike. The prefix is only dropped before a 3, where Pakistani mobiles start.
 */
const national = (phone: string) => phone.replace(/\D/g, '').replace(/^(?:0092|92|0)(?=3)/, '');

export default national;
