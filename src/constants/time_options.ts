/** Times of day every half hour, as "HH:mm" values with "8:30 pm" labels: the booking time picker. */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 ? '30' : '00';
  const label = `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'am' : 'pm'}`;
  return { value: `${String(hours).padStart(2, '0')}:${minutes}`, label };
});

export default TIME_OPTIONS;
